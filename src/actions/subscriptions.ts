"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isUuid } from "@/lib/data/subscriptions";
import { requireUser } from "@/lib/data/user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readString } from "@/lib/validation/shared";
import {
  parseBulkSubscriptions,
  subscriptionInputFromFormData,
  subscriptionSchema,
  type SubscriptionField,
  type SubscriptionValues,
} from "@/lib/validation/subscription";
import type { FormState } from "./form-state";

type SubscriptionFormState = FormState<SubscriptionField>;

const SAVE_ERROR = "Nie udało się zapisać subskrypcji. Spróbuj ponownie.";

function toColumns(values: SubscriptionValues) {
  return {
    name: values.name,
    amount_cents: values.amountCents,
    billing_cycle: values.billingCycle,
    next_payment_date: values.nextPaymentDate,
    trial_ends_at: values.trialEndsAt,
    category: values.category,
    manage_url: values.manageUrl,
    notes: values.notes,
    status: values.status,
  };
}

function parseForm(formData: FormData) {
  const parsed = subscriptionSchema.safeParse(subscriptionInputFromFormData(formData));
  if (parsed.success) return { data: parsed.data } as const;
  return {
    error: {
      status: "error",
      message: "Popraw zaznaczone pola.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    } satisfies SubscriptionFormState,
  } as const;
}

function revalidateApp() {
  revalidatePath("/panel", "layout");
}

export async function createSubscription(
  _prev: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const user = await requireUser();
  const result = parseForm(formData);
  if (result.error) return result.error;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      ...toColumns(result.data),
      user_id: user.id,
      cancelled_at: result.data.status === "cancelled" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return { status: "error", message: SAVE_ERROR };

  // Created from an e-mail suggestion: mark it as handled.
  const detectedId = readString(formData, "detectedId");
  if (detectedId && isUuid(detectedId)) {
    await supabase
      .from("detected_subscriptions")
      .update({ status: "added", subscription_id: data.id })
      .eq("id", detectedId)
      .eq("user_id", user.id);
  }

  revalidateApp();
  redirect(`/panel/subskrypcje/${data.id}?zapisano=1`);
}

export async function updateSubscription(
  id: string,
  _prev: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const user = await requireUser();
  if (!isUuid(id)) return { status: "error", message: SAVE_ERROR };
  const result = parseForm(formData);
  if (result.error) return result.error;

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("status, cancelled_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existing) return { status: "error", message: "Ta subskrypcja nie istnieje lub została usunięta." };

  const statusChanged = existing.status !== result.data.status;
  const { error } = await supabase
    .from("subscriptions")
    .update({
      ...toColumns(result.data),
      cancelled_at: statusChanged
        ? result.data.status === "cancelled"
          ? new Date().toISOString()
          : null
        : existing.cancelled_at,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { status: "error", message: SAVE_ERROR };

  revalidateApp();
  redirect(`/panel/subskrypcje/${id}?zapisano=1`);
}

/**
 * Records that the user cancelled (or resumed) the plan with the provider.
 * SubAlert itself never contacts the provider.
 */
export async function setSubscriptionStatus(id: string, status: "active" | "cancelled"): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("subscriptions")
    .update({ status, cancelled_at: status === "cancelled" ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidateApp();
}

export async function deleteSubscription(id: string): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!isUuid(id)) return { error: "Nieprawidłowa subskrypcja." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("subscriptions").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: "Nie udało się usunąć subskrypcji. Spróbuj ponownie." };
  revalidateApp();
  redirect("/panel/subskrypcje?usunieto=1");
}

export interface BulkFormState {
  status: "idle" | "error";
  message?: string;
  itemErrors?: Record<number, Partial<Record<SubscriptionField, string>>>;
}

/** Quick start: adds several subscriptions at once, validated like the single form. */
export async function createSubscriptionsBulk(_prev: BulkFormState, formData: FormData): Promise<BulkFormState> {
  const user = await requireUser();
  const result = parseBulkSubscriptions(readString(formData, "items"));
  if (!result.ok) return { status: "error", message: result.message, itemErrors: result.itemErrors };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("subscriptions")
    .insert(result.values.map((values) => ({ ...toColumns(values), user_id: user.id, cancelled_at: null })));
  if (error) return { status: "error", message: "Nie udało się zapisać subskrypcji. Spróbuj ponownie." };

  revalidateApp();
  redirect(`/panel?dodano=${result.values.length}`);
}
