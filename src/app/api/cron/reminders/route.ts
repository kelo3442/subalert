import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { dispatchReminders } from "@/lib/reminders/dispatch";
import { dispatchMonthlySummaries, type SummaryResult } from "@/lib/summary/dispatch";

export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Called daily by Vercel Cron (see vercel.json) with `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await dispatchReminders();
    // The monthly summary rides on the same daily run; its failure never blocks reminders.
    let monthly: SummaryResult | { status: "error" };
    try {
      monthly = await dispatchMonthlySummaries();
    } catch (error) {
      console.error("Monthly summary dispatch failed", error);
      monthly = { status: "error" };
    }
    const status = result.status === "not_configured" ? 503 : 200;
    return NextResponse.json({ ...result, monthly }, { status, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Reminder dispatch failed", error);
    return NextResponse.json({ error: "dispatch_failed" }, { status: 500 });
  }
}
