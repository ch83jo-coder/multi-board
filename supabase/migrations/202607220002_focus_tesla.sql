insert into public.boards (
  slug,
  name,
  description,
  icon,
  sort_order,
  is_active
)
values
  (
    'tesla',
    'Teslaオーナー',
    '充電、保険、整備、維持費など、Teslaオーナーの実体験を共有する掲示板です。',
    'electric_car',
    1,
    true
  ),
  (
    'tesla-buying',
    '購入相談',
    'モデル選び、補助金、納期、中古車など、Tesla購入前の疑問を相談する掲示板です。',
    'shopping_cart',
    2,
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = true;

update public.boards
set is_active = false
where slug not in ('tesla', 'tesla-buying');

-- Remove only synthetic development seed posts. Their authors are identified
-- by the fixed local seed email pattern; regular member data is preserved.
delete from public.posts as posts
using public.boards as boards
where posts.board_id = boards.id
  and boards.slug = 'tesla'
  and exists (
    select 1
    from auth.users as users
    where users.id = posts.author_id
      and users.email like 'seed-bot-%@panmoa.local'
  );

delete from public.posts as posts
using public.boards as boards
where posts.board_id = boards.id
  and boards.slug = 'tesla'
  and posts.title = 'testq tesla'
  and posts.content = 'test tesla';
