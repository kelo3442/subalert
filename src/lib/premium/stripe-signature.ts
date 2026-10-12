import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TOLERANCE_SECONDS = 300;

/**
 * Verifies the Stripe-Signature header (https://docs.stripe.com/webhooks#verify-manually):
 * HMAC-SHA256 of "<timestamp>.<raw body>" with the endpoint secret, within a
 * time tolerance to prevent replay.
 */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
): boolean {
  if (!header) return false;
  const parts = header.split(",").map((part) => part.trim().split("="));
  const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value ?? "");
  if (!Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) return false;

  const expected = Buffer.from(createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex"));
  return signatures.some((signature) => {
    const candidate = Buffer.from(signature);
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}
