import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Service-role client that bypasses RLS. Use only in trusted server code
 * (the reminder cron job), never with user-controlled filters.
 */
export function createSupabaseAdminClient() {
  const env = getSupabasePublicEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env || !secretKey) return null;
  return createClient<Database>(env.url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
