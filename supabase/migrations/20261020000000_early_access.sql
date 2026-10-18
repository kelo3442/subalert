-- Launch promotion: the first accounts get Premium for free for a few months.
alter table public.profiles drop constraint profiles_premium_source_check;
alter table public.profiles add constraint profiles_premium_source_check
  check (premium_source in ('subscription', 'one_time', 'early_access'));

-- When the account joined the promotion (null = not part of it). Server-only.
alter table public.profiles add column early_access_at timestamptz;

/**
 * Gives p_user free Premium for p_months if fewer than p_limit accounts have
 * it yet. Serialised with an advisory lock so two sign-ups cannot take the
 * last place. Returns whether the account got it now.
 */
create function public.claim_early_access(p_user uuid, p_limit int, p_months int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('opłacik_early_access'));
  if exists (select 1 from public.profiles where id = p_user and early_access_at is not null) then
    return false;
  end if;
  if (select count(*) from public.profiles where early_access_at is not null) >= p_limit then
    return false;
  end if;
  update public.profiles
     set early_access_at = now(),
         premium_until = greatest(coalesce(premium_until, now()), now()) + make_interval(months => p_months),
         premium_source = case when premium_until is not null and premium_until > now() then premium_source else 'early_access' end
   where id = p_user;
  return found;
end;
$$;

revoke all on function public.claim_early_access(uuid, int, int) from public, anon, authenticated;
grant execute on function public.claim_early_access(uuid, int, int) to service_role;

-- Accounts that already exist (the first testers) are part of the first hundred.
update public.profiles p
   set early_access_at = now(),
       premium_until = greatest(coalesce(p.premium_until, now()), now()) + interval '6 months',
       premium_source = case when p.premium_until is not null and p.premium_until > now() then p.premium_source else 'early_access' end
 where p.id in (select id from public.profiles order by created_at limit 100);
