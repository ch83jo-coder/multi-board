create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 2 and 32),
  avatar_url text,
  karma integer not null default 0,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  description text not null default '',
  icon text not null default 'forum',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete restrict,
  author_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 3 and 160),
  content text not null check (char_length(content) >= 10),
  thumbnail_url text,
  view_count integer not null default 0 check (view_count >= 0),
  comment_count integer not null default 0 check (comment_count >= 0),
  vote_count integer not null default 0,
  is_pinned boolean not null default false,
  is_notice boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null check (char_length(content) >= 2),
  created_at timestamptz not null default now()
);

create table public.post_votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  value smallint not null check (value in (-1, 1)),
  primary key (post_id, user_id)
);

create index posts_board_created_idx on public.posts(board_id, is_pinned desc, created_at desc);
create index posts_vote_count_idx on public.posts(vote_count desc);
create index comments_post_created_idx on public.comments(post_id, created_at);
create index boards_active_sort_idx on public.boards(is_active, sort_order);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), 'member_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Only administrators can change roles';
  end if;
  return new;
end;
$$;

create trigger protect_profile_role_before_update
  before update on public.profiles
  for each row execute procedure public.protect_profile_role();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at before update on public.posts
for each row execute procedure public.set_updated_at();

create or replace function public.sync_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  end if;
  update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

create trigger comments_sync_count
after insert or delete on public.comments
for each row execute procedure public.sync_comment_count();

create or replace function public.sync_vote_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set vote_count = vote_count + new.value where id = new.post_id;
    return new;
  elsif tg_op = 'UPDATE' then
    update public.posts set vote_count = vote_count + new.value - old.value where id = new.post_id;
    return new;
  end if;
  update public.posts set vote_count = vote_count - old.value where id = old.post_id;
  return old;
end;
$$;

create trigger post_votes_sync_count
after insert or update or delete on public.post_votes
for each row execute procedure public.sync_vote_count();

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_votes enable row level security;

create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Members update their profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "Active boards are publicly readable" on public.boards for select using (is_active or public.is_admin());
create policy "Admins create boards" on public.boards for insert to authenticated with check (public.is_admin());
create policy "Admins update boards" on public.boards for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete boards" on public.boards for delete to authenticated using (public.is_admin());

create policy "Posts are publicly readable" on public.posts for select using (true);
create policy "Members create posts" on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy "Authors update posts" on public.posts for update to authenticated using (author_id = auth.uid() or public.is_admin()) with check (author_id = auth.uid() or public.is_admin());
create policy "Authors delete posts" on public.posts for delete to authenticated using (author_id = auth.uid() or public.is_admin());

create policy "Comments are publicly readable" on public.comments for select using (true);
create policy "Members create comments" on public.comments for insert to authenticated with check (author_id = auth.uid());
create policy "Authors update comments" on public.comments for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "Authors delete comments" on public.comments for delete to authenticated using (author_id = auth.uid() or public.is_admin());

create policy "Votes are publicly readable" on public.post_votes for select using (true);
create policy "Members create votes" on public.post_votes for insert to authenticated with check (user_id = auth.uid());
create policy "Members update votes" on public.post_votes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Members delete votes" on public.post_votes for delete to authenticated using (user_id = auth.uid());

-- Restrict user-editable columns. Counters and moderation flags are managed by
-- triggers or service-role admin actions, never by a regular API update.
revoke update on public.profiles from authenticated;
grant update (username, avatar_url) on public.profiles to authenticated;
revoke update on public.posts from authenticated;
grant update (title, content, thumbnail_url) on public.posts to authenticated;
revoke update on public.comments from authenticated;
grant update (content) on public.comments to authenticated;
revoke update on public.post_votes from authenticated;
grant update (value) on public.post_votes to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Post images are publicly readable" on storage.objects for select using (bucket_id = 'post-images');
create policy "Members upload post images" on storage.objects for insert to authenticated with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Members update own post images" on storage.objects for update to authenticated using (bucket_id = 'post-images' and owner_id = auth.uid()::text);
create policy "Members delete own post images" on storage.objects for delete to authenticated using (bucket_id = 'post-images' and owner_id = auth.uid()::text);

insert into public.boards (slug, name, description, icon, sort_order)
values
  ('humor', 'Humor', 'A light place for sharp jokes, memes, and everyday comedy.', 'sentiment_very_satisfied', 1),
  ('news', 'News', 'Breaking stories and considered discussion from around the world.', 'newspaper', 2),
  ('sports', 'Sports', 'Live games, analysis, transfers, and community predictions.', 'sports_soccer', 3),
  ('game', 'Game', 'Games, hardware, releases, guides, and friendly competition.', 'sports_esports', 4)
on conflict (slug) do nothing;
