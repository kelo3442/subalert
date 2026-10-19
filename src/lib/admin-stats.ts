import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AdminStats {
  accounts: number;
  new_7d: number;
  with_items: number;
  with_3_items: number;
  avg_items: number;
  active_7d: number;
  /** Accounts older than a week (the ones that could have come back). */
  eligible_return: number;
  /** Of those, opened the app again at least a week after signing up. */
  returned: number;
  email_users: number;
  push_users: number;
  daily: { day: string; count: number }[];
}

/** Usage counts for the admin page; null when the database function is missing. */
export async function getAdminStats(): Promise<AdminStats | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const { data, error } = await admin.rpc("admin_stats");
  if (error || !data) {
    if (error) console.error("Admin stats failed", error.message);
    return null;
  }
  return data as unknown as AdminStats;
}

/** Remembers when the account last opened the app, at most once an hour. */
export async function touchLastSeen(userId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) return;
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { error } = await admin
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", userId)
    .or(`last_seen_at.is.null,last_seen_at.lt."${hourAgo}"`);
  if (error) console.error("Last seen update failed", error.message);
}
