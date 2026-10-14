import "server-only";
import { cache } from "react";
import { isValidISODate, type ISODate } from "@/lib/dates";
import { BILLING_CYCLES, type BillingCycle } from "@/lib/subscriptions/billing";
import { isCategoryKey, type CategoryKey } from "@/lib/subscriptions/categories";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "./user";

export interface DetectedSubscription {
  id: string;
  name: string;
  amountCents: number | null;
  billingCycle: BillingCycle;
  nextPaymentDate: ISODate | null;
  trialEndsAt: ISODate | null;
  category: CategoryKey | null;
  manageUrl: string | null;
  emailFrom: string | null;
  receivedAt: string;
  status: "pending" | "added" | "dismissed";
  autoAdded: boolean;
  subscriptionId: string | null;
  /** Set when the e-mail updated a subscription the user already had. */
  appliedChange: "payment" | "price" | "trial" | "cancelled" | null;
  previousAmountCents: number | null;
}

const COLUMNS =
  "id, name, amount_cents, billing_cycle, next_payment_date, trial_ends_at, category, manage_url, email_from, received_at, status, auto_added, subscription_id, applied_change, previous_amount_cents";

type Row = {
  id: string;
  name: string;
  amount_cents: number | null;
  billing_cycle: string;
  next_payment_date: string | null;
  trial_ends_at: string | null;
  category: string | null;
  manage_url: string | null;
  email_from: string | null;
  received_at: string;
  status: "pending" | "added" | "dismissed";
  auto_added: boolean;
  subscription_id: string | null;
  applied_change: DetectedSubscription["appliedChange"];
  previous_amount_cents: number | null;
};

function fromRow(row: Row): DetectedSubscription {
  const date = (value: string | null) => (value && isValidISODate(value) ? value : null);
  return {
    id: row.id,
    name: row.name,
    amountCents: row.amount_cents,
    billingCycle: (BILLING_CYCLES as readonly string[]).includes(row.billing_cycle) ? (row.billing_cycle as BillingCycle) : "monthly",
    nextPaymentDate: date(row.next_payment_date),
    trialEndsAt: date(row.trial_ends_at),
    category: row.category && isCategoryKey(row.category) ? row.category : null,
    manageUrl: row.manage_url,
    emailFrom: row.email_from,
    receivedAt: row.received_at,
    status: row.status,
    autoAdded: row.auto_added,
    subscriptionId: row.subscription_id,
    appliedChange: row.applied_change,
    previousAmountCents: row.previous_amount_cents,
  };
}

const RECENT_AUTO_ADDED_DAYS = 14;

/** Pending suggestions plus subscriptions added automatically in the last two weeks. */
export const listDetectedForReview = cache(async (): Promise<DetectedSubscription[]> => {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const since = new Date(Date.now() - RECENT_AUTO_ADDED_DAYS * 86_400_000).toISOString();
  const { data } = await supabase
    .from("detected_subscriptions")
    .select(COLUMNS)
    .eq("user_id", user.id)
    .or(`status.eq.pending,and(auto_added.eq.true,status.eq.added,received_at.gte.${since})`)
    .order("received_at", { ascending: false })
    .limit(20);
  return (data ?? []).map(fromRow);
});

export async function getDetected(id: string): Promise<DetectedSubscription | null> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("detected_subscriptions").select(COLUMNS).eq("user_id", user.id).eq("id", id).maybeSingle();
  return data ? fromRow(data) : null;
}

export interface InboundSettings {
  token: string;
  autoAdd: boolean;
  gmailCode: string | null;
  gmailLink: string | null;
  gmailReceivedAt: string | null;
}

export const getInboundSettings = cache(async (): Promise<InboundSettings | null> => {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("inbound_token, auto_add_detected, gmail_forwarding_code, gmail_forwarding_link, gmail_forwarding_received_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;
  return {
    token: data.inbound_token,
    autoAdd: data.auto_add_detected,
    gmailCode: data.gmail_forwarding_code,
    gmailLink: data.gmail_forwarding_link,
    gmailReceivedAt: data.gmail_forwarding_received_at,
  };
});
