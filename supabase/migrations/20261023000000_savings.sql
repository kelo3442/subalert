-- "Oszczędzaj" tab: tips the user hid, payday, monthly "did you use it?"
-- answers and the monthly summary e-mail.

-- Keys of tips the user answered "Zostawiam" to (e.g. two clouds). Owner-editable.
alter table public.profiles add column dismissed_tips text[] not null default '{}'
  check (cardinality(dismissed_tips) <= 300);

-- Day of the month the user gets paid, for "do wypłaty zostanie". Owner-editable.
alter table public.profiles add column payday smallint check (payday between 1 and 31);

-- Monthly summary e-mail: opt-out flag (owner-editable) and the month it was last sent (server-only).
alter table public.profiles add column monthly_summary_enabled boolean not null default true;
alter table public.profiles add column monthly_summary_sent_on date;

grant update (dismissed_tips, payday, monthly_summary_enabled) on public.profiles to authenticated;

-- One answer per plan and month to "Używałeś tego w tym miesiącu?".
create table public.usage_checks (
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  used boolean not null,
  answered_at timestamptz not null default now(),
  primary key (subscription_id, month)
);

create index usage_checks_user_idx on public.usage_checks (user_id, month);

alter table public.usage_checks enable row level security;

create policy "Usage checks: owner can read"
  on public.usage_checks for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Usage checks: owner can insert"
  on public.usage_checks for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.subscriptions s where s.id = subscription_id and s.user_id = (select auth.uid()))
  );

create policy "Usage checks: owner can update"
  on public.usage_checks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.usage_checks from anon;
revoke delete on public.usage_checks from authenticated;
