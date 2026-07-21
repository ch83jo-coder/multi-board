alter table public.posts
  alter column author_id drop not null,
  add column guest_name text;

alter table public.posts
  add constraint posts_author_or_guest_check
    check (author_id is not null or guest_name is not null),
  add constraint posts_guest_name_length_check
    check (guest_name is null or char_length(btrim(guest_name)) between 1 and 30);

alter table public.comments
  alter column author_id drop not null,
  add column guest_name text;

alter table public.comments
  add constraint comments_author_or_guest_check
    check (author_id is not null or guest_name is not null),
  add constraint comments_guest_name_length_check
    check (guest_name is null or char_length(btrim(guest_name)) between 1 and 30);

create table public.guest_secrets (
  kind text not null check (kind in ('post', 'comment')),
  target_id uuid not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  primary key (kind, target_id)
);

alter table public.guest_secrets enable row level security;
revoke all on table public.guest_secrets from public, anon, authenticated;

create or replace function public.delete_guest_secret_for_target()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.guest_secrets
  where kind = case when tg_table_name = 'posts' then 'post' else 'comment' end
    and target_id = old.id;
  return old;
end;
$$;

revoke all on function public.delete_guest_secret_for_target() from public;

create trigger posts_delete_guest_secret
after delete on public.posts
for each row
when (old.author_id is null)
execute procedure public.delete_guest_secret_for_target();

create trigger comments_delete_guest_secret
after delete on public.comments
for each row
when (old.author_id is null)
execute procedure public.delete_guest_secret_for_target();

create or replace function public.create_guest_post(
  target_board_id uuid,
  post_title text,
  post_content text,
  author_name text,
  guest_password text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  created_post_id uuid;
  normalized_name text := coalesce(nullif(btrim(author_name), ''), '名無しさん');
begin
  if char_length(btrim(post_title)) < 3 or char_length(btrim(post_title)) > 160 then
    raise exception 'Guest post title must be between 3 and 160 characters';
  end if;
  if char_length(btrim(post_content)) < 10 then
    raise exception 'Guest post content must be at least 10 characters';
  end if;
  if char_length(normalized_name) < 1 or char_length(normalized_name) > 30 then
    raise exception 'Guest name must be between 1 and 30 characters';
  end if;
  if char_length(guest_password) < 4 or char_length(guest_password) > 128 then
    raise exception 'Guest password must be between 4 and 128 characters';
  end if;
  if not exists (
    select 1 from public.boards
    where id = target_board_id and is_active = true
  ) then
    raise exception 'Board is not available';
  end if;

  insert into public.posts (board_id, author_id, guest_name, title, content)
  values (
    target_board_id,
    null,
    normalized_name,
    btrim(post_title),
    btrim(post_content)
  )
  returning id into created_post_id;

  insert into public.guest_secrets (kind, target_id, password_hash)
  values (
    'post',
    created_post_id,
    crypt(guest_password, gen_salt('bf'))
  );

  return created_post_id;
end;
$$;

create or replace function public.create_guest_comment(
  target_post_id uuid,
  target_parent_id uuid,
  comment_content text,
  author_name text,
  guest_password text
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  created_comment_id uuid;
  normalized_name text := coalesce(nullif(btrim(author_name), ''), '名無しさん');
  parent_post_id uuid;
  parent_parent_id uuid;
begin
  if char_length(btrim(comment_content)) < 2 then
    raise exception 'Guest comment must be at least 2 characters';
  end if;
  if char_length(normalized_name) < 1 or char_length(normalized_name) > 30 then
    raise exception 'Guest name must be between 1 and 30 characters';
  end if;
  if char_length(guest_password) < 4 or char_length(guest_password) > 128 then
    raise exception 'Guest password must be between 4 and 128 characters';
  end if;
  if not exists (select 1 from public.posts where id = target_post_id) then
    raise exception 'Post does not exist';
  end if;

  if target_parent_id is not null then
    select post_id, parent_id
      into parent_post_id, parent_parent_id
    from public.comments
    where id = target_parent_id;

    if not found
      or parent_post_id is distinct from target_post_id
      or parent_parent_id is not null then
      raise exception 'Reply target is invalid';
    end if;
  end if;

  insert into public.comments (
    post_id,
    author_id,
    guest_name,
    parent_id,
    content
  )
  values (
    target_post_id,
    null,
    normalized_name,
    target_parent_id,
    btrim(comment_content)
  )
  returning id into created_comment_id;

  insert into public.guest_secrets (kind, target_id, password_hash)
  values (
    'comment',
    created_comment_id,
    crypt(guest_password, gen_salt('bf'))
  );

  return created_comment_id;
end;
$$;

create or replace function public.update_guest_post(
  target_post_id uuid,
  guest_password text,
  post_title text,
  post_content text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored_hash text;
  updated_count integer;
begin
  if char_length(btrim(post_title)) < 3 or char_length(btrim(post_title)) > 160 then
    raise exception 'Guest post title must be between 3 and 160 characters';
  end if;
  if char_length(btrim(post_content)) < 10 then
    raise exception 'Guest post content must be at least 10 characters';
  end if;

  select password_hash into stored_hash
  from public.guest_secrets
  where kind = 'post' and target_id = target_post_id
  for update;

  if stored_hash is null or crypt(guest_password, stored_hash) is distinct from stored_hash then
    return false;
  end if;

  update public.posts
  set title = btrim(post_title), content = btrim(post_content)
  where id = target_post_id and author_id is null;
  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

create or replace function public.delete_guest_post(
  target_post_id uuid,
  guest_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored_hash text;
  deleted_count integer;
begin
  select password_hash into stored_hash
  from public.guest_secrets
  where kind = 'post' and target_id = target_post_id
  for update;

  if stored_hash is null or crypt(guest_password, stored_hash) is distinct from stored_hash then
    return false;
  end if;

  delete from public.posts
  where id = target_post_id and author_id is null;
  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$$;

create or replace function public.delete_guest_comment(
  target_comment_id uuid,
  guest_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored_hash text;
  deleted_count integer;
begin
  select password_hash into stored_hash
  from public.guest_secrets
  where kind = 'comment' and target_id = target_comment_id
  for update;

  if stored_hash is null or crypt(guest_password, stored_hash) is distinct from stored_hash then
    return false;
  end if;

  delete from public.comments
  where id = target_comment_id and author_id is null;
  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$$;

revoke all on function public.create_guest_post(uuid, text, text, text, text) from public;
revoke all on function public.create_guest_comment(uuid, uuid, text, text, text) from public;
revoke all on function public.update_guest_post(uuid, text, text, text) from public;
revoke all on function public.delete_guest_post(uuid, text) from public;
revoke all on function public.delete_guest_comment(uuid, text) from public;

grant execute on function public.create_guest_post(uuid, text, text, text, text) to anon, authenticated;
grant execute on function public.create_guest_comment(uuid, uuid, text, text, text) to anon, authenticated;
grant execute on function public.update_guest_post(uuid, text, text, text) to anon, authenticated;
grant execute on function public.delete_guest_post(uuid, text) to anon, authenticated;
grant execute on function public.delete_guest_comment(uuid, text) to anon, authenticated;

alter table public.notifications add column actor_name text;

create or replace function public.notify_post_author_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_author uuid;
  parent_author uuid;
begin
  select author_id into post_author
  from public.posts
  where id = new.post_id;

  if post_author is not null and post_author is distinct from new.author_id then
    insert into public.notifications (
      recipient_id,
      actor_id,
      actor_name,
      type,
      post_id,
      comment_id
    )
    values (
      post_author,
      new.author_id,
      case when new.author_id is null then new.guest_name else null end,
      'comment',
      new.post_id,
      new.id
    );
  end if;

  if new.parent_id is not null then
    select author_id into parent_author
    from public.comments
    where id = new.parent_id;

    if parent_author is not null
      and parent_author is distinct from new.author_id
      and parent_author is distinct from post_author then
      insert into public.notifications (
        recipient_id,
        actor_id,
        actor_name,
        type,
        post_id,
        comment_id
      )
      values (
        parent_author,
        new.author_id,
        case when new.author_id is null then new.guest_name else null end,
        'comment',
        new.post_id,
        new.id
      );
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.notify_post_author_on_comment() from public;
