-- Calendar feed (iCalendar subscription) and Web Push notifications.

-- Private, unguessable token in the user's calendar feed URL (122 random bits).
alter table public.profiles
  add column calendar_token text not null unique default replace(gen_random_uuid()::text, '-', '');

-- Lets the user invalidate a calendar link that leaked or was shared by mistake.
create or replace function public.rotate_calendar_token()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_token text := replace(gen_random_uuid()::text, '-', '');
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  update public.profiles set calendar_token = new_token where id = auth.uid();
  return new_token;
end;
$$;

revoke execute on function public.rotate_calendar_token() from public, anon;
grant execute on function public.rotate_calendar_token() to authenticated;

-- One row per browser/device that allowed notifications.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique check (endpoint ~ '^https://' and char_length(endpoint) <= 1000),
  p256dh text not null check (char_length(p256dh) between 1 and 200),
  auth text not null check (char_length(auth) between 1 and 100),
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Push: owner can read"
  on public.push_subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Push: owner can delete"
  on public.push_subscriptions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Rows are written only through save_push_subscription (below), so a device
-- that switches accounts moves to the account that is signed in now.
revoke insert, update on public.push_subscriptions from anon, authenticated;
revoke all on public.push_subscriptions from anon;

create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, created_at = now();
end;
$$;

revoke execute on function public.save_push_subscription(text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text) to authenticated;
