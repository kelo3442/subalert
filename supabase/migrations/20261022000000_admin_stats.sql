-- When the account last opened the app (updated at most once an hour by the
-- server). Lets the operator see whether people come back. Server-only.
alter table public.profiles add column last_seen_at timestamptz;

/**
 * Usage numbers for the operator's admin page. Counts only, no personal data.
 * "Seen" uses last_seen_at and, for activity before it existed, the last
 * sign-in time from Supabase Auth.
 */
create function public.admin_stats()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  with people as (
    select p.id,
           p.created_at,
           greatest(p.last_seen_at, u.last_sign_in_at) as seen_at
      from public.profiles p
      left join auth.users u on u.id = p.id
  ),
  items as (
    select user_id, count(*) as n
      from public.subscriptions
     where status = 'active'
     group by user_id
  )
  select json_build_object(
    'accounts', (select count(*) from people),
    'new_7d', (select count(*) from people where created_at > now() - interval '7 days'),
    'with_items', (select count(*) from items),
    'with_3_items', (select count(*) from items where n >= 3),
    'avg_items', (select coalesce(round(avg(n), 1), 0) from items),
    'active_7d', (select count(*) from people where seen_at > now() - interval '7 days'),
    'eligible_return', (select count(*) from people where created_at <= now() - interval '7 days'),
    'returned', (select count(*) from people where created_at <= now() - interval '7 days'
                                              and seen_at >= created_at + interval '7 days'),
    'email_users', (select count(distinct user_id) from public.detected_subscriptions),
    'push_users', (select count(distinct user_id) from public.push_subscriptions),
    'daily', (
      select json_agg(json_build_object('day', d::date, 'count', (
        select count(*) from people where (created_at at time zone 'Europe/Warsaw')::date = d::date
      )) order by d)
        from generate_series((now() at time zone 'Europe/Warsaw')::date - 13,
                             (now() at time zone 'Europe/Warsaw')::date, interval '1 day') as d
    )
  );
$$;

revoke all on function public.admin_stats() from public, anon, authenticated;
grant execute on function public.admin_stats() to service_role;
