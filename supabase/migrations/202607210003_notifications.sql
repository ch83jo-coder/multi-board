create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('comment', 'vote')),
  post_id uuid not null references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx
on public.notifications(recipient_id, is_read, created_at desc);

alter table public.notifications enable row level security;

create policy "Recipients read notifications"
on public.notifications for select to authenticated
using (recipient_id = auth.uid());

create policy "Recipients mark notifications read"
on public.notifications for update to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (is_read) on public.notifications to authenticated;

create or replace function public.notify_post_author_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient uuid;
begin
  select author_id into recipient
  from public.posts
  where id = new.post_id;

  if recipient is null or recipient = new.author_id then
    return new;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    post_id,
    comment_id
  )
  values (
    recipient,
    new.author_id,
    'comment',
    new.post_id,
    new.id
  );

  return new;
end;
$$;

revoke all on function public.notify_post_author_on_comment() from public;

create trigger comments_create_notification
after insert on public.comments
for each row execute procedure public.notify_post_author_on_comment();

create or replace function public.notify_post_author_on_vote()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient uuid;
begin
  if tg_op = 'UPDATE' and old.value = new.value then
    return new;
  end if;

  if new.value <> 1 then
    return new;
  end if;

  select author_id into recipient
  from public.posts
  where id = new.post_id;

  if recipient is null or recipient = new.user_id then
    return new;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    post_id
  )
  values (
    recipient,
    new.user_id,
    'vote',
    new.post_id
  );

  return new;
end;
$$;

revoke all on function public.notify_post_author_on_vote() from public;

create trigger post_votes_create_notification
after insert or update of value on public.post_votes
for each row execute procedure public.notify_post_author_on_vote();
