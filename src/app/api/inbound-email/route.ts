import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { processInboundEmail, type InboundPayload } from "@/lib/email-import/process";

export const maxDuration = 30;

const MAX_BODY_BYTES = 5 * 1024 * 1024;

/** The inbound provider calls this URL with HTTP Basic auth; the password must equal INBOUND_EMAIL_WEBHOOK_SECRET. */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.INBOUND_EMAIL_WEBHOOK_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret || !header.startsWith("Basic ")) return false;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const password = Buffer.from(decoded.slice(decoded.indexOf(":") + 1));
  const expected = Buffer.from(secret);
  return password.length === expected.length && timingSafeEqual(password, expected);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
    return NextResponse.json({ status: "too_large" }, { status: 200 });
  }

  let payload: InboundPayload;
  try {
    payload = JSON.parse(body) as InboundPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    // Always 200 for handled mail (even unknown recipients) so the provider does not retry.
    const status = await processInboundEmail(payload);
    return NextResponse.json({ status }, { status: status === "not_configured" ? 503 : 200 });
  } catch (error) {
    console.error("Inbound e-mail processing failed", error);
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
