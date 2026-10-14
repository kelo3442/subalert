"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data/user";
import { getSiteUrl, isPremiumSalesOpen } from "@/lib/env";
import { PREMIUM_PLANS, type PremiumPlan } from "@/lib/premium/plan";
import { createCheckoutSession, createPortalSession, getStripeConfig } from "@/lib/premium/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addToWaitlist } from "@/lib/waitlist";

async function stripeCustomerId(userId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("stripe_customer_id").eq("id", userId).maybeSingle();
  return data?.stripe_customer_id ?? null;
}

export async function startCheckout(plan: PremiumPlan): Promise<void> {
  const user = await requireUser();
  if (!isPremiumSalesOpen()) redirect("/panel/premium");
  const config = getStripeConfig();
  if (!config || !(plan in PREMIUM_PLANS)) redirect("/panel/premium?blad=konfiguracja");

  let url: string;
  try {
    url = await createCheckoutSession(config, {
      plan,
      userId: user.id,
      email: user.email,
      customerId: await stripeCustomerId(user.id),
      successUrl: `${getSiteUrl()}/panel/premium?platnosc=ok`,
      cancelUrl: `${getSiteUrl()}/panel/premium?platnosc=anulowana`,
    });
  } catch (error) {
    console.error("Checkout failed", error);
    redirect("/panel/premium?blad=platnosc");
  }
  redirect(url);
}

export async function openBillingPortal(): Promise<void> {
  const user = await requireUser();
  const config = getStripeConfig();
  const customerId = await stripeCustomerId(user.id);
  if (!config || !customerId) redirect("/panel/premium?blad=konfiguracja");

  let url: string;
  try {
    url = await createPortalSession(config, customerId, `${getSiteUrl()}/panel/premium`);
  } catch (error) {
    console.error("Billing portal failed", error);
    redirect("/panel/premium?blad=platnosc");
  }
  redirect(url);
}

/** "Tell me when Premium launches": a timestamp in the user's own auth metadata. */
export async function joinPremiumWaitlist(): Promise<void> {
  const user = await requireUser();
  if (!user.premiumWaitlist) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({
      data: { premium_waitlist_at: new Date().toISOString() },
    });
    if (error) {
      console.error("Premium waitlist failed", error.message);
      redirect("/panel/premium?blad=lista");
    }
    if (user.email) await addToWaitlist({ email: user.email, userId: user.id, source: "app" });
  }
  redirect("/panel/premium?lista=ok");
}
