import { NextResponse, type NextRequest } from "next/server";
import { entitlementChange, type StripeEvent } from "@/lib/premium/entitlement";
import { getStripeConfig } from "@/lib/premium/stripe";
import { verifyStripeSignature } from "@/lib/premium/stripe-signature";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** Stripe webhook: grants and revokes Premium. Configure the endpoint in the Stripe dashboard. */
export async function POST(request: NextRequest) {
  const config = getStripeConfig();
  const admin = createSupabaseAdminClient();
  if (!config || !admin) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), config.webhookSecret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Each event is applied once, even if Stripe delivers it again.
  const { error: seenError } = await admin.from("stripe_events").insert({ id: event.id, type: event.type });
  if (seenError) {
    if (seenError.code === "23505") return NextResponse.json({ status: "duplicate" });
    console.error("Stripe event log failed", seenError);
    return NextResponse.json({ error: "storage_failed" }, { status: 500 });
  }

  try {
    const object = event.data?.object ?? {};
    const metadata = (object.metadata ?? {}) as Record<string, unknown>;
    const userIdHint =
      (typeof object.client_reference_id === "string" && object.client_reference_id) ||
      (typeof metadata.user_id === "string" && metadata.user_id) ||
      null;
    const customerHint = typeof object.customer === "string" ? object.customer : null;

    const query = admin.from("profiles").select("id, premium_until, premium_source");
    const { data: profile } = userIdHint
      ? await query.eq("id", userIdHint).maybeSingle()
      : customerHint
        ? await query.eq("stripe_customer_id", customerHint).maybeSingle()
        : { data: null };
    if (!profile) return NextResponse.json({ status: "ignored" });

    const change = entitlementChange(event, { premiumUntil: profile.premium_until, premiumSource: profile.premium_source });
    if (!change) return NextResponse.json({ status: "ignored" });

    const { error } = await admin.from("profiles").update(change.update).eq("id", profile.id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ status: "applied" });
  } catch (error) {
    // Allow Stripe to retry: forget the event so the retry is processed.
    await admin.from("stripe_events").delete().eq("id", event.id);
    console.error("Stripe webhook failed", error);
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
