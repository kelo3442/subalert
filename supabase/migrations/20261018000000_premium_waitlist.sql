-- People waiting for Premium: visitors from the landing page (no account) and
-- signed-in users. Written and read only by the server (service role).
create table public.premium_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 320 and email like '%_@_%'),
  user_id uuid references auth.users (id) on delete cascade,
  source text not null default 'landing' check (source in ('landing', 'app')),
  -- Secret in the "wypisz mnie" link of every e-mail.
  unsubscribe_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  unsubscribed_at timestamptz
);

create unique index premium_waitlist_email_idx on public.premium_waitlist (lower(email));

alter table public.premium_waitlist enable row level security;
revoke all on public.premium_waitlist from anon, authenticated;

-- Users who already clicked "Powiadom mnie" in the app (stored in auth metadata until now).
insert into public.premium_waitlist (email, user_id, source, created_at)
select lower(u.email), u.id, 'app', coalesce((u.raw_user_meta_data ->> 'premium_waitlist_at')::timestamptz, now())
from auth.users u
where u.raw_user_meta_data ? 'premium_waitlist_at' and u.email is not null
on conflict (lower(email)) do nothing;
