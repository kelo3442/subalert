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

-- Free plan: at most 3 active subscriptions, enforced by the database.
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', :'alice', false);
do $$
declare n int;
begin
  select count(*) into n from public.subscriptions where status = 'active';
  -- Alice has 1 active subscription; two more fit, the fourth must fail.
  insert into public.subscriptions (name, amount_cents, billing_cycle, next_payment_date)
  values ('Prąd', 18000, 'bimonthly', '2026-11-10');
  update public.subscriptions set amount_is_estimate = true where name = 'Prąd';
  insert into public.subscriptions (name, amount_cents, billing_cycle, next_payment_date, category)
  values ('OC', 60000, 'semiannual', '2027-01-10', 'insurance');
  begin
    insert into public.subscriptions (name, amount_cents, billing_cycle, next_payment_date)
    values ('Czwarta', 100, 'monthly', '2026-11-01');
    raise exception 'FAIL: free plan limit not enforced';
  exception when raise_exception then
    if sqlerrm <> 'free_plan_limit' then raise; end if;
  end;
  -- A cancelled one can be added, but not reactivated while at the limit.
  insert into public.subscriptions (name, amount_cents, billing_cycle, next_payment_date, status)
  values ('Stara', 100, 'monthly', '2026-11-01', 'cancelled');
  begin
    update public.subscriptions set status = 'active' where name = 'Stara';
    raise exception 'FAIL: reactivation bypassed limit';
  exception when raise_exception then null;
  end;
  begin
    update public.profiles set premium_until = now() + interval '1 year';
    raise exception 'FAIL: user granted themselves premium';
  exception when insufficient_privilege then null;
  end;
  assert not public.is_premium(auth.uid()), 'FAIL: unexpectedly premium';
end $$;

-- Multi-row inserts are counted row by row.
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', :'bob', false);
do $$ begin
  begin
    insert into public.subscriptions (name, amount_cents, billing_cycle, next_payment_date)
    values ('B1', 100, 'monthly', '2026-11-01'), ('B2', 100, 'monthly', '2026-11-01'), ('B3', 100, 'monthly', '2026-11-01');
    raise exception 'FAIL: bulk insert bypassed limit';
  exception when raise_exception then
    if sqlerrm <> 'free_plan_limit' then raise; end if;
  end;
  assert (select count(*) from public.subscriptions) = 1, 'FAIL: partial bulk insert kept';
end $$;

-- Premium (set by the service role, as the Stripe webhook does) lifts the limit.
reset role;
set role service_role;
update public.profiles set premium_until = now() + interval '30 days', premium_source = 'subscription'
 where id = '00000000-0000-0000-0000-00000000000a';
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', :'alice', false);
do $$ begin
  assert public.is_premium(auth.uid()), 'FAIL: premium not detected';
  insert into public.subscriptions (name, amount_cents, billing_cycle, next_payment_date)
  values ('Czwarta', 100, 'monthly', '2026-11-01');
  update public.subscriptions set status = 'active' where name = 'Stara';
  assert (select count(*) from public.subscriptions where status = 'active') = 5, 'FAIL: premium limit';
  begin
    perform count(*) from public.stripe_events;
    raise exception 'FAIL: user can read stripe events';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Calendar feed token: private per user, rotatable only by its owner.
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', :'alice', false);
do $$
declare old_token text;
begin
  assert (select count(*) from public.profiles) = 1, 'FAIL: sees other calendar tokens';
  select calendar_token into old_token from public.profiles;
  assert char_length(old_token) = 32, 'FAIL: calendar token length';
  perform public.rotate_calendar_token();
  assert (select calendar_token from public.profiles) <> old_token, 'FAIL: calendar token not rotated';
  begin
    update public.profiles set calendar_token = 'x';
    raise exception 'FAIL: user can set calendar token directly';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Push subscriptions: written only through save_push_subscription, visible to the owner only;
-- a device that signs in to another account moves to that account.
select public.save_push_subscription('https://push.example/device-1', 'p256', 'auth');
select public.save_push_subscription('https://push.example/device-1', 'p256-new', 'auth-new');
do $$ begin
  assert (select count(*) from public.push_subscriptions) = 1, 'FAIL: push upsert';
  assert (select p256dh from public.push_subscriptions) = 'p256-new', 'FAIL: push keys not updated';
  begin
    insert into public.push_subscriptions (user_id, endpoint, p256dh, auth)
    values (auth.uid(), 'https://push.example/direct', 'a', 'b');
    raise exception 'FAIL: direct push insert allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.save_push_subscription('http://insecure.example', 'a', 'b');
    raise exception 'FAIL: non-https endpoint accepted';
  exception when check_violation then null;
  end;
end $$;

select set_config('request.jwt.claim.sub', :'bob', false);
do $$ begin
  assert (select count(*) from public.push_subscriptions) = 0, 'FAIL: bob sees alice devices';
  delete from public.push_subscriptions;
end $$;
select public.save_push_subscription('https://push.example/device-1', 'k', 'a');
do $$ begin
  assert (select count(*) from public.push_subscriptions) = 1, 'FAIL: device not moved to bob';
end $$;
select set_config('request.jwt.claim.sub', :'alice', false);
do $$ begin
  assert (select count(*) from public.push_subscriptions) = 0, 'FAIL: alice still owns moved device';
end $$;

reset role;
set role anon;
do $$ begin
  begin
    perform public.save_push_subscription('https://push.example/anon', 'a', 'b');
    raise exception 'FAIL: anon saved push subscription';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.rotate_calendar_token();
    raise exception 'FAIL: anon rotated calendar token';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Feedback: users insert their own messages only, read only their own, at most 10 a day.
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', :'alice', false);
do $$
declare i int;
begin
  insert into public.feedback (user_id, message) values (auth.uid(), 'Świetna aplikacja');
  begin
    insert into public.feedback (user_id, message) values ('00000000-0000-0000-0000-00000000000b', 'Podszywam się');
    raise exception 'FAIL: feedback as another user';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.feedback set message = 'zmiana';
    raise exception 'FAIL: feedback update allowed';
  exception when insufficient_privilege then null;
  end;
  for i in 2..10 loop
    insert into public.feedback (user_id, message) values (auth.uid(), 'Wiadomość ' || i);
  end loop;
  begin
    insert into public.feedback (user_id, message) values (auth.uid(), 'Jedenasta');
    raise exception 'FAIL: feedback limit not enforced';
  exception when raise_exception then
    if sqlerrm <> 'feedback_limit' then raise; end if;
  end;
end $$;
select set_config('request.jwt.claim.sub', :'bob', false);
do $$ begin
  assert (select count(*) from public.feedback) = 0, 'FAIL: bob reads alice feedback';
end $$;
reset role;
set role anon;
do $$ begin
  begin
    perform count(*) from public.feedback;
    raise exception 'FAIL: anon reads feedback';
  exception when insufficient_privilege then null;
  end;
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

-- The welcome e-mail flag is set only by the server.
set role authenticated;
select set_config('request.jwt.claim.sub', :'alice', false);
do $$ begin
  begin
    update public.profiles set welcome_email_sent_at = null;
    raise exception 'FAIL: user changed welcome_email_sent_at';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- Launch Premium is granted only by the server.
set role authenticated;
select set_config('request.jwt.claim.sub', :'alice', false);
do $$ begin
  begin
    perform public.claim_early_access('00000000-0000-0000-0000-00000000000a', 100, 6);
    raise exception 'FAIL: user claimed early access';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.profiles set early_access_at = now();
    raise exception 'FAIL: user set early_access_at';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
do $$ begin
  -- Paid Premium keeps its source; a free account gets 'early_access'.
  update public.profiles set premium_until = null, premium_source = null where id = '00000000-0000-0000-0000-00000000000a';
  assert public.claim_early_access('00000000-0000-0000-0000-00000000000a', 1, 6), 'FAIL: first claim';
  assert not public.claim_early_access('00000000-0000-0000-0000-00000000000a', 1, 6), 'FAIL: second claim for the same user';
  assert not public.claim_early_access('00000000-0000-0000-0000-00000000000b', 1, 6), 'FAIL: claim over the limit';
  assert (select premium_source from public.profiles where id = '00000000-0000-0000-0000-00000000000a') = 'early_access', 'FAIL: source';
  assert (select premium_until > now() + interval '5 months' from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), 'FAIL: months';
  assert public.is_premium('00000000-0000-0000-0000-00000000000a'), 'FAIL: alice should be premium';
  update public.profiles set premium_until = null, premium_source = null, early_access_at = null where id = '00000000-0000-0000-0000-00000000000a';
end $$;

-- Premium waitlist: only the server (service role) reads or writes it.
reset role;
insert into public.premium_waitlist (email, user_id, source) values ('bob@example.pl', :'bob', 'app'), ('gosc@example.pl', null, 'landing');
do $$ begin
  begin
    insert into public.premium_waitlist (email) values ('dup@example.pl'), ('DUP@example.pl');
    raise exception 'FAIL: duplicate waitlist email (case-insensitive)';
  exception when unique_violation then null;
  end;
end $$;
set role authenticated;
select set_config('request.jwt.claim.sub', :'bob', false);
do $$ begin
  begin
    perform count(*) from public.premium_waitlist;
    raise exception 'FAIL: authenticated reads waitlist';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.premium_waitlist (email) values ('x@example.pl');
    raise exception 'FAIL: authenticated writes waitlist';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
set role anon;
do $$ begin
  begin
    perform count(*) from public.premium_waitlist;
    raise exception 'FAIL: anon reads waitlist';
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
  assert not exists (select from public.push_subscriptions where user_id = '00000000-0000-0000-0000-00000000000b'), 'FAIL: bob devices left behind';
  assert not exists (select from public.premium_waitlist where email = 'bob@example.pl'), 'FAIL: bob waitlist entry left behind';
  assert exists (select from public.premium_waitlist where email = 'gosc@example.pl'), 'FAIL: guest waitlist entry deleted';
end $$;

reset role;
\echo 'RLS tests passed'
