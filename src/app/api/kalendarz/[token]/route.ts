import { NextResponse, type NextRequest } from "next/server";
import { buildCalendar, CALENDAR_HORIZON_DAYS } from "@/lib/calendar/ics";
import { DEFAULT_TIME_ZONE, todayInTimeZone } from "@/lib/dates";
import { getSiteUrl } from "@/lib/env";
import { subscriptionFromRow, SUBSCRIPTION_COLUMNS } from "@/lib/subscriptions/mapping";
import { upcomingEvents } from "@/lib/subscriptions/schedule";
import type { Subscription } from "@/lib/subscriptions/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const TOKEN_PATTERN = /^[0-9a-f]{32}$/;

/**
 * Private iCalendar feed that calendar apps (Google, Apple, Outlook) subscribe
 * to. The unguessable token in the URL is the only credential, so unknown
 * tokens get the same 404 as malformed ones.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/kalendarz/[token]">) {
  const token = (await ctx.params).token.replace(/\.ics$/, "");
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!TOKEN_PATTERN.test(token)) return new NextResponse("Not found", { status: 404 });

  const { data: profile } = await admin.from("profiles").select("id, time_zone").eq("calendar_token", token).maybeSingle();
  if (!profile) return new NextResponse("Not found", { status: 404 });

  const { data: rows, error } = await admin
    .from("subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .eq("user_id", profile.id)
    .eq("status", "active");
  if (error) return NextResponse.json({ error: "unavailable" }, { status: 500 });

  const subscriptions = rows.map(subscriptionFromRow).filter((s): s is Subscription => s !== null);
  const today = todayInTimeZone(profile.time_zone || DEFAULT_TIME_ZONE);
  const ics = buildCalendar(upcomingEvents(subscriptions, today, CALENDAR_HORIZON_DAYS), { appUrl: getSiteUrl() });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="oplacik.ics"',
      "Cache-Control": "private, max-age=900",
      "X-Robots-Tag": "noindex",
    },
  });
}
