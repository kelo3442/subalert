"use server";

import { revalidatePath } from "next/cache";
import { isUuid } from "@/lib/data/subscriptions";
import { getUserProfile, requireUser } from "@/lib/data/user";
import { todayInTimeZone } from "@/lib/dates";
import { monthStart } from "@/lib/savings/usage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_TIPS = 300;
const TIP_KEY = /^[a-z]+:[0-9a-f,-]{1,800}$/;

/** "Zostawiam": hides a tip (e.g. two clouds) for good. */
export async function dismissTip(key: string): Promise<void> {
  const user = await requireUser();
  if (!TIP_KEY.test(key)) return;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("profiles").select("dismissed_tips").eq("id", user.id).maybeSingle();
  if (error || !data) return;
  const tips = data.dismissed_tips ?? [];
  if (tips.includes(key)) return;
  await supabase
    .from("profiles")
    .update({ dismissed_tips: [...tips, key].slice(-MAX_TIPS) })
    .eq("id", user.id);
  revalidatePath("/panel", "layout");
}

/** "Korzystałeś z tego w ostatnim miesiącu?" — one answer per plan and month. */
export async function answerUsage(subscriptionId: string, used: boolean): Promise<void> {
  const user = await requireUser();
  if (!isUuid(subscriptionId)) return;
  const profile = await getUserProfile();
  const month = monthStart(todayInTimeZone(profile.timeZone));
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("usage_checks")
    .upsert({ subscription_id: subscriptionId, user_id: user.id, month, used, answered_at: new Date().toISOString() });
  revalidatePath("/panel", "layout");
}

/** Day of the month the user gets paid (empty clears it). */
export async function setPayday(formData: FormData): Promise<void> {
  const user = await requireUser();
  const raw = String(formData.get("payday") ?? "");
  const day = raw === "" ? null : Number(raw);
  if (day !== null && !(Number.isInteger(day) && day >= 1 && day <= 31)) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").update({ payday: day }).eq("id", user.id);
  revalidatePath("/panel", "layout");
}

/** Turns the monthly summary e-mail on or off. */
export async function setMonthlySummary(formData: FormData): Promise<void> {
  const user = await requireUser();
  const enabled = formData.get("monthlySummary") === "on";
  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").update({ monthly_summary_enabled: enabled }).eq("id", user.id);
  revalidatePath("/panel", "layout");
}
