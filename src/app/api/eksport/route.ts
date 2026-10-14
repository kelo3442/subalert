import { NextResponse } from "next/server";
import { listSubscriptions } from "@/lib/data/subscriptions";
import { getCurrentUser } from "@/lib/data/user";
import { subscriptionsToCsv } from "@/lib/export";

/** Download of the signed-in user's subscriptions (data portability). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const csv = subscriptionsToCsv(await listSubscriptions());
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="oplacik-subskrypcje.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
