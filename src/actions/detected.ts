"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDetected } from "@/lib/data/detected";
import { isUuid } from "@/lib/data/subscriptions";
import { requireUser } from "@/lib/data/user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function dismissDetected(id: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("detected_subscriptions").update({ status: "dismissed" }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/panel", "layout");
}

/**
 * Adds a detected subscription in one click when the e-mail gave us everything;
 * otherwise opens the form prefilled with what was found.
 */
export async function acceptDetected(id: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) return;
  const detected = await getDetected(id);
  if (!detected || detected.status !== "pending") return;

  if (!detected.amountCents || !detected.nextPaymentDate) {
    redirect(`/panel/subskrypcje/nowa?wykryta=${id}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      name: detected.name,
      amount_cents: detected.amountCents,
      billing_cycle: detected.billingCycle,
      next_payment_date: detected.nextPaymentDate,
      trial_ends_at: detected.trialEndsAt,
      category: detected.category,
      manage_url: detected.manageUrl,
    })
    .select("id")
    .single();
  if (error) redirect(`/panel/subskrypcje/nowa?wykryta=${id}`);

  await supabase
    .from("detected_subscriptions")
    .update({ status: "added", subscription_id: data.id })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/panel", "layout");
}

export async function setAutoAddDetected(enabled: boolean): Promise<void> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").update({ auto_add_detected: enabled }).eq("id", user.id);
  revalidatePath("/panel/ustawienia");
}

export async function rotateInboundAddress(): Promise<void> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  await supabase.rpc("rotate_inbound_token");
  revalidatePath("/panel/ustawienia");
}
