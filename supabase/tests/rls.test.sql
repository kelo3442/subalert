-- Verifies that users can only see and modify their own data.
-- Run after the migration: psql -v ON_ERROR_STOP=1 -f rls.test.sql
\set alice '00000000-0000-0000-0000-00000000000a'
\set bob   '00000000-0000-0000-0000-00000000000b'

insert into auth.users (id, email) values (:'alice', 'alice@example.pl'), (:'bob', 'bob@example.pl');

-- Profiles are created by the trigger.
do $$ begin
  assert (select count(*) from public.profiles) = 2, 'profiles should be created by trigger';
end $$;

-- Alice adds a subscription (user_id defaults to auth.uid()).
set role authenticated;
select set_config('request.jwt.claim.sub', :'alice', false);
insert into public.subscriptions (name, amount_cents, billing_cycle, next_payment_date)
values ('Netflix', 4900, 'monthly', '2026-10-20');

-- Alice cannot insert a row owned by Bob.
do $$ begin
  begin
    insert into public.subscriptions (user_id, name, amount_cents, billing_cycle, next_payment_date)
    values ('00000000-0000-0000-0000-00000000000b', 'Hack', 100, 'monthly', '2026-10-20');
    raise exception 'FAIL: inserted row for another user';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Bob sees nothing of Alice's data and cannot change or delete it.
select set_config('request.jwt.claim.sub', :'bob', false);
do $$
declare affected int;
begin
  assert (select count(*) from public.subscriptions) = 0, 'FAIL: bob sees alice subscriptions';
  assert (select count(*) from public.profiles) = 1, 'FAIL: bob sees other profiles';
  update public.subscriptions set amount_cents = 1;
  get diagnostics affected = row_count;
  assert affected = 0, 'FAIL: bob updated alice subscription';
  delete from public.subscriptions;
  get diagnostics affected = row_count;
  assert affected = 0, 'FAIL: bob deleted alice subscription';
end $$;

-- Bob cannot move his own row to Alice.
insert into public.subscriptions (name, amount_cents, billing_cycle, next_payment_date)
values ('Spotify', 2399, 'monthly', '2026-10-14');
do $$ begin
  begin
    update public.subscriptions set user_id = '00000000-0000-0000-0000-00000000000a';
    raise exception 'FAIL: reassigned row to another user';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Users can change preferences but not the profile e-mail.
do $$ begin
  update public.profiles set reminder_days_before = 5, time_zone = 'Europe/Berlin';
  begin
    update public.profiles set email = 'spoof@example.pl';
    raise exception 'FAIL: user changed profile e-mail';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Users cannot write reminders or claim them.
do $$ begin
  begin
    insert into public.reminders (user_id, subscription_id, kind, event_date, send_on)
    select auth.uid(), id, 'payment', '2026-10-14', '2026-10-11' from public.subscriptions;
    raise exception 'FAIL: user inserted reminder';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.claim_reminder(gen_random_uuid());
    raise exception 'FAIL: user called claim_reminder';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Anonymous visitors see nothing.
reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  begin
    perform count(*) from public.subscriptions;
    raise exception 'FAIL: anon read subscriptions';
  exception when insufficient_privilege then null;
  end;
end $$;

-- The service role (cron) deduplicates and claims reminders exactly once.
reset role;
set role service_role;
insert into public.reminders (user_id, subscription_id, kind, event_date, send_on)
select user_id, id, 'payment', '2026-10-20', '2026-10-17' from public.subscriptions where name = 'Netflix';
insert into public.reminders (user_id, subscription_id, kind, event_date, send_on)
select user_id, id, 'payment', '2026-10-20', '2026-10-17' from public.subscriptions where name = 'Netflix'
on conflict (subscription_id, kind, event_date) do nothing;
do $$
declare rid uuid;
begin
  assert (select count(*) from public.reminders) = 1, 'FAIL: duplicate reminder row';
  select id into rid from public.reminders;
  assert (select count(*) from public.claim_reminder(rid)) = 1, 'FAIL: first claim should succeed';
  assert (select count(*) from public.claim_reminder(rid)) = 0, 'FAIL: second claim must not succeed';
end $$;

-- Each user reads only their own reminders.
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', :'bob', false);
do $$ begin
  assert (select count(*) from public.reminders) = 0, 'FAIL: bob sees alice reminders';
end $$;
select set_config('request.jwt.claim.sub', :'alice', false);
do $$ begin
  assert (select count(*) from public.reminders) = 1, 'FAIL: alice cannot see her reminder';
end $$;

-- Constraints reject invalid data even if the app validation is bypassed.
do $$ begin
  begin
    insert into public.subscriptions (name, amount_cents, billing_cycle, next_payment_date, manage_url)
    values ('X', 100, 'monthly', '2026-10-20', 'javascript:alert(1)');
    raise exception 'FAIL: accepted javascript: URL';
  exception when check_violation then null;
  end;
  begin
    insert into public.subscriptions (name, amount_cents, billing_cycle, next_payment_date)
    values ('X', -5, 'monthly', '2026-10-20');
    raise exception 'FAIL: accepted negative amount';
  exception when check_violation then null;
  end;
end $$;

-- Detected subscriptions (from forwarded e-mails): written by the service role only.
reset role;
set role service_role;
insert into public.detected_subscriptions (user_id, message_id, name, amount_cents)
values ('00000000-0000-0000-0000-00000000000a', 'msg-1', 'Netflix', 4900);
do $$ begin
  begin
    insert into public.detected_subscriptions (user_id, message_id, name)
    values ('00000000-0000-0000-0000-00000000000a', 'msg-1', 'Netflix');
    raise exception 'FAIL: duplicate message accepted';
  exception when unique_violation then null;
  end;
end $$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', :'bob', false);
do $$
declare affected int;
begin
  assert (select count(*) from public.detected_subscriptions) = 0, 'FAIL: bob sees alice detections';
  update public.detected_subscriptions set status = 'dismissed';
  get diagnostics affected = row_count;
  assert affected = 0, 'FAIL: bob changed alice detection';
  assert (select count(*) from public.profiles where inbound_token is not null) = 1, 'FAIL: bob sees other tokens';
  begin
    insert into public.detected_subscriptions (user_id, message_id, name)
    values (auth.uid(), 'fake', 'Fake');
    raise exception 'FAIL: user inserted detection';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub', :'alice', false);
do $$
declare
  old_token text;
  bob_token text;
begin
  update public.detected_subscriptions set status = 'dismissed' where message_id = 'msg-1';
  assert (select status from public.detected_subscriptions where message_id = 'msg-1') = 'dismissed', 'FAIL: alice cannot dismiss';
  begin
    update public.detected_subscriptions set name = 'Changed';
    raise exception 'FAIL: user changed detection name';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.profiles set inbound_token = 'chosen-by-user';
    raise exception 'FAIL: user set own token';
  exception when insufficient_privilege then null;
  end;
  select inbound_token into old_token from public.profiles;
  perform public.rotate_inbound_token();
  assert (select inbound_token from public.profiles) <> old_token, 'FAIL: token not rotated';
  assert (select char_length(inbound_token) from public.profiles) = 32, 'FAIL: token length';
end $$;

-- Account deletion removes only the caller and cascades to their data.
reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  begin
    perform public.delete_own_account();
    raise exception 'FAIL: anon called delete_own_account';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', :'bob', false);
select public.delete_own_account();

reset role;
do $$ begin
  assert (select count(*) from auth.users) = 1, 'FAIL: wrong number of users after deletion';
  assert not exists (select from auth.users where id = '00000000-0000-0000-0000-00000000000b'), 'FAIL: bob still exists';
  assert exists (select from auth.users where id = '00000000-0000-0000-0000-00000000000a'), 'FAIL: alice was deleted';
  assert not exists (select from public.subscriptions where user_id = '00000000-0000-0000-0000-00000000000b'), 'FAIL: bob data left behind';
  assert not exists (select from public.profiles where id = '00000000-0000-0000-0000-00000000000b'), 'FAIL: bob profile left behind';
  assert exists (select from public.subscriptions where user_id = '00000000-0000-0000-0000-00000000000a'), 'FAIL: alice data deleted';
end $$;

reset role;
\echo 'RLS tests passed'
