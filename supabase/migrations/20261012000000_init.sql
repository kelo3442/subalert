-- SubAlert: initial schema (profiles, subscriptions, reminders) with Row Level Security.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user, created by trigger. Passwords live only in
-- Supabase Auth; this table stores reminder preferences.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  time_zone text not null default 'Europe/Warsaw'
    check (char_length(time_zone) between 1 and 64),
  reminders_enabled boolean not null default true,
  reminder_days_before smallint not null default 3
    check (reminder_days_before between 0 and 14),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users created before this migration.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;

create policy "Profiles: owner can read"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Profiles: owner can update"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Users may only change their preferences, never id or the copied e-mail.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (time_zone, reminders_enabled, reminder_days_before)
  on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Subscriptions
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  amount_cents integer not null check (amount_cents > 0 and amount_cents <= 10000000),
  currency text not null default 'PLN' check (currency = 'PLN'),
  billing_cycle text not null
    check (billing_cycle in ('weekly', 'monthly', 'quarterly', 'yearly')),
  -- The next charge entered by the user; later charges are derived from it.
  next_payment_date date not null,
  trial_ends_at date,
  category text check (category in (
    'video', 'music', 'ai', 'software', 'cloud', 'gaming',
    'news', 'education', 'fitness', 'shopping', 'other'
  )),
  manage_url text check (manage_url ~* '^https?://' and char_length(manage_url) <= 500),
  notes text check (char_length(notes) <= 500),
  -- 'cancelled' means the USER cancelled it with the provider; SubAlert never does.
  status text not null default 'active' check (status in ('active', 'cancelled')),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_status_idx on public.subscriptions (user_id, status);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "Subscriptions: owner can read"
  on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Subscriptions: owner can insert"
  on public.subscriptions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Subscriptions: owner can update"
  on public.subscriptions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Subscriptions: owner can delete"
  on public.subscriptions for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.subscriptions from anon;

-- ---------------------------------------------------------------------------
-- Reminders: one row per (subscription, kind, event date). The unique key is
-- what guarantees an e-mail is sent at most once per event. Rows are written
-- only by the server-side cron job using the service role.
-- ---------------------------------------------------------------------------
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  kind text not null check (kind in ('payment', 'trial_end')),
  event_date date not null,
  send_on date not null,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed')),
  attempts smallint not null default 0,
  last_error text,
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subscription_id, kind, event_date)
);

create index reminders_status_idx on public.reminders (status, send_on);
create index reminders_user_idx on public.reminders (user_id);

create trigger reminders_set_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

alter table public.reminders enable row level security;

create policy "Reminders: owner can read"
  on public.reminders for select to authenticated
  using ((select auth.uid()) = user_id);

revoke insert, update, delete on public.reminders from anon, authenticated;
revoke all on public.reminders from anon;

-- Atomically takes a reminder for delivery. Concurrent cron runs cannot both
-- claim the same row; a row stuck in 'sending' (crashed run) is retried after
-- 15 minutes, and failed rows are retried at most 3 times in total.
create or replace function public.claim_reminder(p_reminder_id uuid)
returns setof public.reminders
language sql
security invoker
set search_path = ''
as $$
  update public.reminders
     set status = 'sending',
         attempts = attempts + 1
   where id = p_reminder_id
     and attempts < 3
     and (
       status in ('pending', 'failed')
       or (status = 'sending' and updated_at < now() - interval '15 minutes')
     )
  returning *;
$$;

revoke execute on function public.claim_reminder(uuid) from public, anon, authenticated;
grant execute on function public.claim_reminder(uuid) to service_role;
