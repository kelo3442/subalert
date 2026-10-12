-- Bills (utilities, rent, insurance), extra billing cycles and the Premium plan.

-- ---------------------------------------------------------------------------
-- Bills: new categories and cycles (electricity is often billed every 2 months,
-- insurance instalments every 6 months), plus variable "estimated" amounts.
-- ---------------------------------------------------------------------------
alter table public.subscriptions drop constraint subscriptions_billing_cycle_check;
alter table public.subscriptions add constraint subscriptions_billing_cycle_check
  check (billing_cycle in ('weekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'yearly'));

alter table public.subscriptions drop constraint subscriptions_category_check;
alter table public.subscriptions add constraint subscriptions_category_check
  check (category in (
    'video', 'music', 'ai', 'software', 'cloud', 'gaming', 'news', 'education', 'fitness', 'shopping',
    'utilities', 'housing', 'telecom', 'insurance', 'other'
  ));

alter table public.subscriptions
  add column amount_is_estimate boolean not null default false;

alter table public.detected_subscriptions drop constraint detected_subscriptions_billing_cycle_check;
alter table public.detected_subscriptions add constraint detected_subscriptions_billing_cycle_check
  check (billing_cycle in ('weekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'yearly'));

alter table public.detected_subscriptions drop constraint detected_subscriptions_category_check;
alter table public.detected_subscriptions add constraint detected_subscriptions_category_check
  check (category in (
    'video', 'music', 'ai', 'software', 'cloud', 'gaming', 'news', 'education', 'fitness', 'shopping',
    'utilities', 'housing', 'telecom', 'insurance', 'other'
  ));

-- ---------------------------------------------------------------------------
-- Premium. Written only by the Stripe webhook (service role); users can read
-- their own profile but the column grants do not let them change these.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column premium_until timestamptz,
  add column premium_source text check (premium_source in ('subscription', 'one_time')),
  add column stripe_customer_id text unique,
  add column stripe_subscription_id text;

-- Processed Stripe events, so a redelivered webhook is applied once.
create table public.stripe_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;
revoke all on public.stripe_events from anon, authenticated;

create or replace function public.is_premium(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select premium_until > now() from public.profiles where id = p_user_id), false);
$$;

revoke execute on function public.is_premium(uuid) from public, anon;
grant execute on function public.is_premium(uuid) to authenticated, service_role;

-- Free plan: at most 3 active subscriptions. Enforced in the database so the
-- limit also holds for requests that bypass the app. Keep FREE_PLAN_LIMIT in
-- src/lib/premium/plan.ts in sync.
create or replace function public.enforce_free_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_count integer;
begin
  if new.status <> 'active' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'active' then
    return new;
  end if;
  if public.is_premium(new.user_id) then
    return new;
  end if;
  -- Serialise concurrent inserts of the same user so both cannot pass the check.
  perform 1 from public.profiles where id = new.user_id for update;
  select count(*) into active_count
    from public.subscriptions
   where user_id = new.user_id and status = 'active' and id <> new.id;
  if active_count >= 3 then
    raise exception 'free_plan_limit' using errcode = 'P0001',
      hint = 'The free plan allows 3 active subscriptions.';
  end if;
  return new;
end;
$$;

create trigger subscriptions_free_plan_limit
  before insert or update of status on public.subscriptions
  for each row execute function public.enforce_free_plan_limit();
