import "server-only";
import { PREMIUM_PLANS, type PremiumPlan } from "./plan";

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

export function getStripeConfig(): StripeConfig | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) return null;
  return { secretKey, webhookSecret };
}

async function stripePost(config: StripeConfig, path: string, params: Record<string, string>) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  const body = (await response.json().catch(() => ({}))) as { url?: string; error?: { message?: string } };
  if (!response.ok || !body.url) {
    throw new Error(`Stripe ${path} ${response.status}: ${body.error?.message ?? "unknown error"}`);
  }
  return body.url;
}

/**
 * Current state of a subscription. Webhook events can arrive out of order, so
 * the webhook applies this rather than the (possibly stale) event payload.
 */
export async function retrieveSubscription(config: StripeConfig, id: string): Promise<Record<string, unknown>> {
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${config.secretKey}` },
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown> & { error?: { message?: string } };
  if (!response.ok || body.object !== "subscription") {
    throw new Error(`Stripe subscriptions ${response.status}: ${body.error?.message ?? "unknown error"}`);
  }
  return body;
}

/**
 * Monthly: card subscription renewed automatically (BLIK and Przelewy24 do not
 * support recurring payments). Yearly: one-time payment for 12 months, which
 * can be paid with BLIK, Przelewy24 or a card, and does not renew by itself.
 * Payment methods shown are the ones enabled in the Stripe dashboard.
 */
export async function createCheckoutSession(
  config: StripeConfig,
  options: {
    plan: PremiumPlan;
    userId: string;
    email: string;
    customerId: string | null;
    successUrl: string;
    cancelUrl: string;
  },
): Promise<string> {
  const { plan, userId } = options;
  const params: Record<string, string> = {
    client_reference_id: userId,
    "metadata[user_id]": userId,
    "metadata[plan]": plan,
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    locale: "pl",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "pln",
    "line_items[0][price_data][unit_amount]": String(PREMIUM_PLANS[plan].cents),
    // Software as a service, personal use. Required when Stripe Managed Payments
    // is enabled on the account; harmless otherwise.
    "line_items[0][price_data][product_data][tax_code]": "txcd_10103000",
  };
  if (options.customerId) params.customer = options.customerId;
  else params.customer_email = options.email;

  if (plan === "monthly") {
    params.mode = "subscription";
    params["line_items[0][price_data][product_data][name]"] = "Opłacik Premium — miesięcznie";
    params["line_items[0][price_data][recurring][interval]"] = "month";
    params["subscription_data[metadata][user_id]"] = userId;
  } else {
    params.mode = "payment";
    params["line_items[0][price_data][product_data][name]"] = "Opłacik Premium — 12 miesięcy";
    params["payment_intent_data[metadata][user_id]"] = userId;
    params["invoice_creation[enabled]"] = "true";
    if (!options.customerId) params.customer_creation = "always";
  }
  return stripePost(config, "checkout/sessions", params);
}

/** Stripe-hosted page where subscribers change the card or cancel. */
export async function createPortalSession(config: StripeConfig, customerId: string, returnUrl: string): Promise<string> {
  return stripePost(config, "billing_portal/sessions", { customer: customerId, return_url: returnUrl });
}
