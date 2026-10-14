-- E-mails about subscriptions the user already tracks now update them
-- (next payment date, price, trial end, cancellation). Each applied change is
-- logged as a detected_subscriptions row so the dashboard can show it.
alter table public.detected_subscriptions
  add column applied_change text check (applied_change in ('payment', 'price', 'trial', 'cancelled')),
  add column previous_amount_cents integer check (previous_amount_cents > 0 and previous_amount_cents <= 10000000);

-- Feedback sent from the app ("Zgłoś opinię").
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  message text not null check (char_length(btrim(message)) between 3 and 2000),
  page text check (char_length(page) <= 200),
  created_at timestamptz not null default now()
);

create index feedback_user_created_idx on public.feedback (user_id, created_at);

alter table public.feedback enable row level security;

create policy "Feedback: owner can insert"
  on public.feedback for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Feedback: owner can read"
  on public.feedback for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.feedback from anon;
revoke update, delete on public.feedback from authenticated;

-- At most 10 messages per user per day.
create or replace function public.limit_feedback()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.feedback
      where user_id = new.user_id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'feedback_limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger feedback_limit
  before insert on public.feedback
  for each row execute function public.limit_feedback();
