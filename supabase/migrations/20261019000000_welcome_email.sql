-- One welcome e-mail per account, sent on the first visit to the panel.
-- Written only by the server (service role); users cannot change it.
alter table public.profiles add column welcome_email_sent_at timestamptz;

-- Accounts that already exist never get it.
update public.profiles set welcome_email_sent_at = now();
