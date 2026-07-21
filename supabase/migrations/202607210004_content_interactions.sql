create or replace function public.increment_view_count(target_post_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.posts
  set view_count = view_count + 1
  where id = target_post_id
  returning view_count;
$$;

revoke all on function public.increment_view_count(uuid) from public;
grant execute on function public.increment_view_count(uuid) to anon, authenticated;

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

  if post_author is not null and post_author <> new.author_id then
    insert into public.notifications (
      recipient_id,
      actor_id,
      type,
      post_id,
      comment_id
    )
    values (
      post_author,
      new.author_id,
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
      and parent_author <> new.author_id
      and parent_author is distinct from post_author then
      insert into public.notifications (
        recipient_id,
        actor_id,
        type,
        post_id,
        comment_id
      )
      values (
        parent_author,
        new.author_id,
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
