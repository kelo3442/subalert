-- Lets a signed-in user delete their own account. Deleting the auth user
-- cascades to profiles, subscriptions and reminders.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  delete from auth.users where id = current_user_id;
end;
$$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
