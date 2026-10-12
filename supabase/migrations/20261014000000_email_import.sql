-- Automatic detection of subscriptions from forwarded e-mails.

-- Each user gets a private, unguessable forwarding token (122 random bits).
alter table public.profiles
  add column inbound_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  add column auto_add_detected boolean not null default true,
  -- Gmail sends a confirmation code to a new forwarding address; we show it to the user.
  add column gmail_forwarding_code text,
  add column gmail_forwarding_link text,
  add column gmail_forwarding_received_at timestamptz;

grant update (auto_add_detected) on public.profiles to authenticated;

-- Lets the user invalidate their forwarding address (e.g. if it leaked).
create or replace function public.rotate_inbound_token()
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
  update public.profiles set inbound_token = new_token where id = auth.uid();
  return new_token;
end;
$$;

revoke execute on function public.rotate_inbound_token() from public, anon;
grant execute on function public.rotate_inbound_token() to authenticated;

-- Subscriptions found in e-mails. Only extracted fields are stored, never the body.
create table public.detected_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  message_id text not null check (char_length(message_id) <= 300),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  amount_cents integer check (amount_cents > 0 and amount_cents <= 10000000),
  billing_cycle text not null default 'monthly'
    check (billing_cycle in ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_payment_date date,
  trial_ends_at date,
  category text check (category in (
    'video', 'music', 'ai', 'software', 'cloud', 'gaming',
    'news', 'education', 'fitness', 'shopping', 'other'
  )),
  manage_url text check (manage_url ~* '^https?://' and char_length(manage_url) <= 500),
  email_from text check (char_length(email_from) <= 200),
  email_subject text check (char_length(email_subject) <= 200),
  received_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'added', 'dismissed')),
  auto_added boolean not null default false,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  created_at timestamptz not null default now(),
  -- The same e-mail delivered twice is processed once.
  unique (user_id, message_id)
);

create index detected_subscriptions_user_status_idx on public.detected_subscriptions (user_id, status);

alter table public.detected_subscriptions enable row level security;

create policy "Detected: owner can read"
  on public.detected_subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Detected: owner can update status"
  on public.detected_subscriptions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Rows are created only by the inbound webhook (service role). Users may only
-- change the review status and the link to the subscription they created.
revoke insert, update, delete on public.detected_subscriptions from anon, authenticated;
revoke all on public.detected_subscriptions from anon;
grant update (status, subscription_id) on public.detected_subscriptions to authenticated;
