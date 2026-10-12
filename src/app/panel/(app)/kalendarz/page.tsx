import { CalendarDays, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarAgenda } from "@/components/app/calendar-agenda";
import { PageHeader } from "@/components/app/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { EmptyState } from "@/components/ui/empty-state";
import { listSubscriptions } from "@/lib/data/subscriptions";
import { getUserProfile } from "@/lib/data/user";
import { addDays, todayInTimeZone } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import { scheduleBetween } from "@/lib/subscriptions/schedule";

export const metadata: Metadata = { title: "Kalendarz płatności" };

const RANGES = [
  { key: "30", label: "30 dni", days: 30 },
  { key: "90", label: "3 miesiące", days: 90 },
  { key: "365", label: "Rok", days: 365 },
] as const;

export default async function CalendarPage({ searchParams }: PageProps<"/panel/kalendarz">) {
  const params = await searchParams;
  const range = RANGES.find((r) => r.key === params.zakres) ?? RANGES[1];
  const [profile, subscriptions] = await Promise.all([getUserProfile(), listSubscriptions()]);
  const today = todayInTimeZone(profile.timeZone);
  const events = scheduleBetween(subscriptions, today, today, addDays(today, range.days));
  const total = events.filter((e) => e.kind === "payment").reduce((sum, e) => sum + e.subscription.amountCents, 0);

  return (
    <>
      <PageHeader
        title="Kalendarz płatności"
        description={events.length > 0 ? `W tym okresie zapłacisz łącznie ${formatPLN(total)}.` : "Nadchodzące płatności i końce okresów próbnych."}
      />
      <div role="tablist" aria-label="Zakres" className="mb-6 inline-flex rounded-xl border border-line bg-surface p-1">
        {RANGES.map((r) => (
          <Link
            key={r.key}
            role="tab"
            aria-selected={r.key === range.key}
            href={`/panel/kalendarz?zakres=${r.key}`}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4",
              r.key === range.key ? "bg-surface-3 text-fg" : "text-muted hover:text-fg",
            )}
          >
            {r.label}
          </Link>
        ))}
      </div>
      {events.length > 0 ? (
        <CalendarAgenda events={events} />
      ) : (
        <Card>
          <EmptyState
            icon={<CalendarDays className="size-6" aria-hidden />}
            title="Brak płatności w tym okresie"
            description="Gdy dodasz aktywne subskrypcje, ich kolejne terminy pojawią się tutaj."
            action={
              <ButtonLink href="/panel/subskrypcje/nowa">
                <Plus className="size-4" aria-hidden /> Dodaj subskrypcję
              </ButtonLink>
            }
          />
        </Card>
      )}
    </>
  );
}
