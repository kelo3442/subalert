import { Download, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LaunchNotifyForm } from "@/components/app/launch-notify-form";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { requireUser } from "@/lib/data/user";
import { isPremiumSalesOpen } from "@/lib/env";
import { isAdminEmail, listWaitlist } from "@/lib/waitlist";

export const metadata: Metadata = { title: "Administracja", robots: { index: false } };

function addressesLabel(n: number): string {
  if (n === 1) return "1 adres";
  const few = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
  return `${n} ${few ? "adresy" : "adresów"}`;
}

const dateTime = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Warsaw" });

export default async function AdminPage() {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) notFound();

  const entries = await listWaitlist();
  const active = entries.filter((entry) => !entry.unsubscribedAt);
  const pending = active.filter((entry) => !entry.notifiedAt).length;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Administracja" description="Lista chętnych na Premium. Widoczne tylko dla adresów z ADMIN_EMAILS." />
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          ["Na liście", active.length],
          ["Czeka na powiadomienie", pending],
          ["Wypisani", entries.length - active.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">{value}</p>
          </div>
        ))}
      </div>

      <Card className="mb-4">
        <CardHeader title="Start Premium" description="Gdy włączysz sprzedaż, powiadom wszystkich z listy." />
        <div className="p-5 pt-3">
          <LaunchNotifyForm pending={pending} salesOpen={isPremiumSalesOpen()} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          icon={<Users className="size-5" aria-hidden />}
          title="Chętni na Premium"
          description={`${addressesLabel(entries.length)}, najnowsze na górze`}
          action={
            <a href="/api/admin/lista" className={buttonClasses("secondary", "sm")}>
              <Download className="size-4" aria-hidden /> CSV
            </a>
          }
        />
        {entries.length === 0 ? (
          <p className="px-5 pb-5 pt-3 text-sm text-muted">Nikt jeszcze się nie zapisał.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line" data-testid="waitlist-entries">
            {entries.map((entry) => (
              <li key={entry.email} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className={`truncate font-medium ${entry.unsubscribedAt ? "text-subtle line-through" : "text-fg"}`}>{entry.email}</p>
                  <p className="text-xs text-muted">
                    {dateTime.format(new Date(entry.createdAt))} · {entry.source === "app" ? "z aplikacji (ma konto)" : "ze strony głównej"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {entry.unsubscribedAt ? <Badge>wypisany</Badge> : entry.notifiedAt ? <Badge tone="accent">powiadomiony</Badge> : <Badge tone="warn">czeka</Badge>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
