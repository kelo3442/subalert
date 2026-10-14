import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data/user";
import { isAdminEmail, listWaitlist } from "@/lib/waitlist";

const cell = (value: string) => `"${value.replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`;

/** Admin-only CSV export of the Premium waitlist. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) return new NextResponse("Not found", { status: 404 });
  const rows = (await listWaitlist()).map((entry) =>
    [entry.email, entry.source === "app" ? "aplikacja" : "strona główna", entry.createdAt, entry.notifiedAt ?? "", entry.unsubscribedAt ?? ""].map(cell).join(";"),
  );
  const csv = "﻿" + ["E-mail;Źródło;Zapisano;Powiadomiono;Wypisano", ...rows].join("\r\n") + "\r\n";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="oplacik-lista-premium.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
