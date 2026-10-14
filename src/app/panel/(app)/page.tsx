import { CalendarClock, CalendarRange, Layers, Plus, Wallet, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryBreakdown } from "@/components/app/category-breakdown";
import { DetectedPanel } from "@/components/app/detected-panel";
import { listDetectedForReview } from "@/lib/data/detected";
import { getInboundConfig } from "@/lib/email-import/config";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { SubscriptionList } from "@/components/app/subscription-list";
import { TrialGuardPanel } from "@/components/app/trial-guard-panel";
import { UpcomingList } from "@/components/app/upcoming-list";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listSubscriptions } from "@/lib/data/subscriptions";
import { getUserProfile } from "@/lib/data/user";
import { formatDateShort, formatRelativeDays, todayInTimeZone } from "@/lib/dates";
import { formatAmount, formatPLN } from "@/lib/money";
import {
  activeSubscriptions,
  activeTrials,
  categoryBreakdown,
  summarize,
  upcomingEvents,
} from "@/lib/subscriptions/schedule";

export const metadata: Metadata = { title: "Pulpit" };

const UPCOMING_DAYS = 30;

export default async function DashboardPage({ searchParams }: PageProps<"/panel">) {
  const [profile, subscriptions, params, detected] = await Promise.all([
    getUserProfile(),
    listSubscriptions(),
    searchParams,
    listDetectedForReview(),
  ]);
  const today = todayInTimeZone(profile.timeZone);
  const emailImportAvailable = getInboundConfig() !== null;
  const detectedPanel = detected.length > 0 && (
    <div className="mb-4">
      <DetectedPanel items={detected} />
    </div>
  );
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
        {detectedPanel}
        <Card>
          <EmptyState
            icon={<Layers className="size-6" aria-hidden />}
            title="Dodaj swoje subskrypcje"
            description="Zaznacz usługi, z których korzystasz, i wpisz kwoty — zajmie to około minuty. Podsumowania, kalendarz i przypomnienia pojawią się automatycznie."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <ButtonLink href="/panel/start" size="lg">
                  <Zap className="size-4" aria-hidden /> Szybki start
                </ButtonLink>
                <ButtonLink href="/panel/subskrypcje/nowa" variant="ghost" size="lg">
                  Dodaj jedną ręcznie
                </ButtonLink>
              </div>
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

      {typeof params.dodano === "string" && Number(params.dodano) > 0 && (
        <Alert tone="success" className="mb-4">
          Dodano subskrypcje: {Number(params.dodano)}. Łącznie płacisz{" "}
          <strong className="font-semibold">{formatPLN(summary.monthlyCents)}</strong> miesięcznie, czyli{" "}
          <strong className="font-semibold">{formatPLN(summary.yearlyCents)}</strong> rocznie. Uzupełnij okresy próbne i
          linki do anulowania w szczegółach każdej usługi.
          {emailImportAvailable && (
            <>
              {" "}
              <Link href="/panel/ustawienia#automatyczne" className="font-semibold underline underline-offset-2">
                Włącz automatyczne dodawanie nowych subskrypcji z e-maili
              </Link>
              .
            </>
          )}
        </Alert>
      )}

      {detectedPanel}

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
          value={next ? formatAmount(next.subscription.amountCents, next.subscription.amountIsEstimate) : "—"}
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

      {/* On phones the list would repeat "Nadchodzące odnowienia"; the full list is one tap away in the bottom bar. */}
      <Card className="mt-4 hidden overflow-hidden lg:block">
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
