import { CalendarClock, CalendarRange, Layers, Plus, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryBreakdown } from "@/components/app/category-breakdown";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { SubscriptionList } from "@/components/app/subscription-list";
import { TrialGuardPanel } from "@/components/app/trial-guard-panel";
import { UpcomingList } from "@/components/app/upcoming-list";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listSubscriptions } from "@/lib/data/subscriptions";
import { getUserProfile } from "@/lib/data/user";
import { formatDateShort, formatRelativeDays, todayInTimeZone } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import {
  activeSubscriptions,
  activeTrials,
  categoryBreakdown,
  summarize,
  upcomingEvents,
} from "@/lib/subscriptions/schedule";

export const metadata: Metadata = { title: "Pulpit" };

const UPCOMING_DAYS = 30;

export default async function DashboardPage() {
  const [profile, subscriptions] = await Promise.all([getUserProfile(), listSubscriptions()]);
  const today = todayInTimeZone(profile.timeZone);
  const summary = summarize(subscriptions, today);
  const active = activeSubscriptions(subscriptions);

  const addButton = (
    <div className="hidden sm:block">
      <ButtonLink href="/panel/subskrypcje/nowa">
        <Plus className="size-4" aria-hidden /> Dodaj subskrypcję
      </ButtonLink>
    </div>
  );

  if (subscriptions.length === 0) {
    return (
      <>
        <PageHeader title="Pulpit" description="Tu zobaczysz swoje wydatki i nadchodzące płatności." />
        <Card>
          <EmptyState
            icon={<Layers className="size-6" aria-hidden />}
            title="Dodaj pierwszą subskrypcję"
            description="Wybierz usługę z listy popularnych albo wpisz własną. Podsumowania, kalendarz i przypomnienia pojawią się automatycznie."
            action={
              <ButtonLink href="/panel/subskrypcje/nowa">
                <Plus className="size-4" aria-hidden /> Dodaj subskrypcję
              </ButtonLink>
            }
          />
        </Card>
      </>
    );
  }

  const trials = activeTrials(subscriptions, today);
  const upcoming = upcomingEvents(subscriptions, today, UPCOMING_DAYS);
  const shares = categoryBreakdown(subscriptions);
  const next = summary.nextPayment;

  return (
    <>
      <PageHeader title="Pulpit" description={`Dzisiaj jest ${formatDateShort(today)}.`} action={addButton} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Miesięcznie"
          value={formatPLN(summary.monthlyCents)}
          detail="średnio, wszystkie cykle"
          icon={<Wallet className="size-4" aria-hidden />}
          highlight
        />
        <StatCard
          label="Rocznie"
          value={formatPLN(summary.yearlyCents)}
          detail={`w ciągu 30 dni: ${formatPLN(summary.next30DaysCents)}`}
          icon={<CalendarRange className="size-4" aria-hidden />}
        />
        <StatCard
          label="Aktywne"
          value={summary.activeCount}
          detail={summary.cancelledCount > 0 ? `anulowane: ${summary.cancelledCount}` : "subskrypcje"}
          icon={<Layers className="size-4" aria-hidden />}
        />
        <StatCard
          label="Najbliższa płatność"
          value={next ? formatPLN(next.subscription.amountCents) : "—"}
          detail={next ? `${next.subscription.name}, ${formatRelativeDays(next.daysUntil)}` : "brak aktywnych"}
          icon={<CalendarClock className="size-4" aria-hidden />}
        />
      </div>

      {trials.length > 0 && (
        <div className="mt-4">
          <TrialGuardPanel trials={trials} today={today} />
        </div>
      )}

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader
            title="Nadchodzące odnowienia"
            description={`Najbliższe ${UPCOMING_DAYS} dni`}
            action={
              <Link href="/panel/kalendarz" className="shrink-0 text-sm font-medium text-accent hover:underline">
                Kalendarz
              </Link>
            }
          />
          <div className="mt-3 pb-2">
            {upcoming.length > 0 ? (
              <UpcomingList events={upcoming.slice(0, 8)} />
            ) : (
              <p className="px-5 pb-4 text-sm text-muted">Brak płatności w najbliższych {UPCOMING_DAYS} dniach.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Wydatki według kategorii" description="Średni koszt miesięczny" />
          <div className="mt-4">
            {shares.length > 0 ? (
              <CategoryBreakdown shares={shares} />
            ) : (
              <p className="px-5 pb-5 text-sm text-muted">Brak aktywnych subskrypcji.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <CardHeader
          title="Twoje subskrypcje"
          description={`Aktywne: ${active.length}`}
          action={
            <Link href="/panel/subskrypcje" className="shrink-0 text-sm font-medium text-accent hover:underline">
              Wszystkie
            </Link>
          }
        />
        <div className="mt-3">
          {active.length > 0 ? (
            <SubscriptionList subscriptions={active.slice(0, 6)} today={today} />
          ) : (
            <p className="px-5 pb-5 text-sm text-muted">Wszystkie subskrypcje są oznaczone jako anulowane.</p>
          )}
        </div>
      </Card>
    </>
  );
}
