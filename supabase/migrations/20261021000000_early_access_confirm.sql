-- Launch Premium is granted only after the owner of the address clicks a
-- one-time link sent to it, so throwaway sign-ups cannot use up the places.
-- Only a SHA-256 hash of the link token is stored. Written by the server only.
alter table public.profiles add column early_access_token_hash text;
alter table public.profiles add column early_access_token_sent_at timestamptz;
create unique index profiles_early_access_token_hash_key
  on public.profiles (early_access_token_hash) where early_access_token_hash is not null;
