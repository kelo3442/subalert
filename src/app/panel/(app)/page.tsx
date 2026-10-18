import { CalendarDays, Layers, Plus, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryBreakdown } from "@/components/app/category-breakdown";
import { DetectedPanel } from "@/components/app/detected-panel";
import { listDetectedForReview } from "@/lib/data/detected";
import { getInboundConfig } from "@/lib/email-import/config";
import { PageHeader } from "@/components/app/page-header";
import { SubscriptionList } from "@/components/app/subscription-list";
import { TrialGuardPanel } from "@/components/app/trial-guard-panel";
import { UpcomingList } from "@/components/app/upcoming-list";
import { InstallBanner } from "@/components/pwa/install-banner";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listSubscriptions } from "@/lib/data/subscriptions";
import { EarlyAccessPending } from "@/components/premium/early-access-pending";
import { getUserProfile, requireUser } from "@/lib/data/user";
import { formatRelativeDays, todayInTimeZone } from "@/lib/dates";
import { formatAmount, formatPLN } from "@/lib/money";
import {
  activeSubscriptions,
  activeTrials,
  categoryBreakdown,
  summarize,
  upcomingEvents,
} from "@/lib/subscriptions/schedule";

export const metadata: Metadata = { title: "Start" };

const UPCOMING_DAYS = 30;
const UPCOMING_SHOWN = 5;

export default async function DashboardPage({ searchParams }: PageProps<"/panel">) {
  const [user, profile, subscriptions, params, detected] = await Promise.all([
    requireUser(),
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
  const claimCard = (
    <EarlyAccessPending user={user} returnTo="/panel" notice={typeof params.link === "string" ? params.link : undefined} />
  );
  const summary = summarize(subscriptions, today);
  const active = activeSubscriptions(subscriptions);

  const addButton = (
    <ButtonLink href="/panel/subskrypcje/nowa" size="lg" className="w-full text-lg">
      <Plus className="size-5" aria-hidden /> Dodaj nową opłatę
    </ButtonLink>
  );

  if (subscriptions.length === 0) {
    return (
      <>
        <PageHeader title="Dzień dobry!" description="Tu zobaczysz swoje stałe opłaty i najbliższe płatności." />
        {claimCard}
        {detectedPanel}
        <Card>
          <EmptyState
            icon={<Layers className="size-6" aria-hidden />}
            title="Dodaj swoje stałe opłaty"
            description="Zaznacz, za co płacisz (np. Netflix, prąd, telefon), i wpisz kwoty — zajmie to około minuty. Potem przypomnimy Ci o każdej płatności."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <ButtonLink href="/panel/start" size="lg">
                  <Zap className="size-4" aria-hidden /> Zacznij tutaj
                </ButtonLink>
                <ButtonLink href="/panel/subskrypcje/nowa" variant="ghost" size="lg">
                  Dodaj jedną opłatę
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
      <PageHeader title="Dzień dobry!" description="Oto Twoje stałe opłaty." />
      {claimCard}

      {typeof params.dodano === "string" && Number(params.dodano) > 0 && (
        <Alert tone="success" className="mb-4">
          Dodano opłaty: {Number(params.dodano)}. Razem płacisz średnio{" "}
          <strong className="font-semibold">{formatPLN(summary.monthlyCents)}</strong> miesięcznie.
          {emailImportAvailable && (
            <>
              {" "}
              <Link href="/panel/ustawienia#automatyczne" className="font-semibold underline underline-offset-2">
                Włącz automatyczne dodawanie z e-maili
              </Link>
              .
            </>
          )}
        </Alert>
      )}

      <InstallBanner />
      {detectedPanel}

      <section aria-label="Podsumowanie" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="text-base text-muted">Średnio płacisz miesięcznie</p>
        <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums text-accent sm:text-5xl">{formatPLN(summary.monthlyCents)}</p>
        <p className="mt-2 text-base text-muted">
          To <strong className="font-semibold text-fg">{formatPLN(summary.yearlyCents)}</strong> w ciągu roku ·{" "}
          {summary.activeCount} {summary.activeCount === 1 ? "opłata" : summary.activeCount % 10 >= 2 && summary.activeCount % 10 <= 4 && (summary.activeCount % 100 < 12 || summary.activeCount % 100 > 14) ? "opłaty" : "opłat"}
        </p>
        {next && (
          <p className="mt-3 rounded-xl bg-surface-2 px-4 py-3 text-base text-fg">
            Najbliższa płatność: <strong className="font-semibold">{next.subscription.name}</strong>, {formatRelativeDays(next.daysUntil)} —{" "}
            <strong className="font-semibold tabular-nums">{formatAmount(next.subscription.amountCents, next.subscription.amountIsEstimate)}</strong>
          </p>
        )}
      </section>

      {trials.length > 0 && (
        <div className="mt-4">
          <TrialGuardPanel trials={trials} today={today} />
        </div>
      )}

      <div className="mt-4">{addButton}</div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader title={<span className="text-lg">Najbliższe płatności</span>} description={`W ciągu ${UPCOMING_DAYS} dni`} />
          <div className="mt-3">
            {upcoming.length > 0 ? (
              <UpcomingList events={upcoming.slice(0, UPCOMING_SHOWN)} />
            ) : (
              <p className="px-5 pb-4 text-base text-muted">Brak płatności w najbliższych {UPCOMING_DAYS} dniach.</p>
            )}
          </div>
          <div className="p-4 pt-2">
            <ButtonLink href="/panel/kalendarz" variant="secondary" className="w-full">
              <CalendarDays className="size-4" aria-hidden /> Pokaż wszystkie płatności
            </ButtonLink>
          </div>
        </Card>

        <Card>
          <CardHeader title={<span className="text-lg">Na co wydajesz</span>} description="Średnio miesięcznie" />
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
          title={<span className="text-lg">Moje opłaty</span>}
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
            <p className="px-5 pb-5 text-sm text-muted">Wszystkie opłaty są oznaczone jako zakończone.</p>
          )}
        </div>
      </Card>
    </>
  );
}
