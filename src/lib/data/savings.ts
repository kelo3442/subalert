import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UsageAnswer } from "@/lib/savings/usage";
import { requireUser } from "./user";

export interface SavingsPrefs {
  dismissedTips: string[];
  payday: number | null;
  monthlySummaryEnabled: boolean;
  /** False until migration 20261023000000_savings.sql has been run. */
  ready: boolean;
}

export const getSavingsPrefs = cache(async (): Promise<SavingsPrefs> => {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("dismissed_tips, payday, monthly_summary_enabled")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return { dismissedTips: [], payday: null, monthlySummaryEnabled: true, ready: false };
  return {
    dismissedTips: data.dismissed_tips ?? [],
    payday: data.payday,
    monthlySummaryEnabled: data.monthly_summary_enabled,
    ready: true,
  };
});

/** Answers to "Korzystałeś z tego?" from the last few months. */
export const listUsageAnswers = cache(async (): Promise<UsageAnswer[]> => {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - 6);
  const { data, error } = await supabase
    .from("usage_checks")
    .select("subscription_id, month, used")
    .eq("user_id", user.id)
    .gte("month", since.toISOString().slice(0, 10));
  if (error || !data) return [];
  return data.map((row) => ({ subscriptionId: row.subscription_id, month: row.month, used: row.used }));
});
