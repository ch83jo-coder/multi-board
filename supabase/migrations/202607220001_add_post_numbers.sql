alter table public.posts
  add column post_number bigint;

-- Preserve the original update timestamp while assigning stable numbers to
-- existing posts in chronological order.
alter table public.posts disable trigger posts_set_updated_at;

with numbered_posts as (
  select
    id,
    row_number() over (order by created_at, id) as post_number
  from public.posts
)
update public.posts as posts
set post_number = numbered_posts.post_number
from numbered_posts
where posts.id = numbered_posts.id;

alter table public.posts enable trigger posts_set_updated_at;

alter table public.posts
  alter column post_number set not null,
  alter column post_number add generated always as identity;

select setval(
  pg_get_serial_sequence('public.posts', 'post_number'),
  greatest(coalesce(max(post_number), 0) + 1, 1),
  false
)
from public.posts;

alter table public.posts
  add constraint posts_post_number_key unique (post_number);

comment on column public.posts.post_number is
  'Globally unique, stable display number assigned when a post is created.';
