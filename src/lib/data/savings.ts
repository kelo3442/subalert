import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
