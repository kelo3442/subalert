import { ArrowLeft, BellRing, CalendarClock, Hourglass, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DaysBadge } from "@/components/app/days-badge";
import { PageHeader } from "@/components/app/page-header";
import { TRIAL_DISCLAIMER } from "@/components/app/trial-guard-panel";
import { CancelAssistant } from "@/components/subscriptions/cancel-assistant";
import { DeleteSubscriptionButton } from "@/components/subscriptions/delete-subscription-button";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { getEmailConfig } from "@/lib/email/resend";
import { getSubscription } from "@/lib/data/subscriptions";
import { getUserProfile } from "@/lib/data/user";
import { compareISODates, daysBetween, formatDateLong, formatRelativeDays, pluralDays, todayInTimeZone } from "@/lib/dates";
import { formatAmount, formatPLN } from "@/lib/money";
import { reminderSendDate } from "@/lib/reminders/schedule";
import {
  BILLING_CYCLE_LABELS,
  BILLING_CYCLE_SUFFIX,
  monthlyCostCents,
  nextPaymentOnOrAfter,
  nthPaymentDate,
  yearlyCostCents,
} from "@/lib/subscriptions/billing";
import { CATEGORY_LABELS } from "@/lib/subscriptions/categories";
import { getTrialStatus } from "@/lib/subscriptions/trials";

export const metadata: Metadata = { title: "Subskrypcja" };

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-subtle">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-fg">{children}</dd>
    </div>
  );
}

export default async function SubscriptionPage({ params, searchParams }: PageProps<"/panel/subskrypcje/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [subscription, profile] = await Promise.all([getSubscription(id), getUserProfile()]);
  if (!subscription) notFound();

  const today = todayInTimeZone(profile.timeZone);
  const active = subscription.status === "active";
  const next = nextPaymentOnOrAfter(subscription.nextPaymentDate, subscription.billingCycle, today);
  const following = [1, 2, 3].map((n) =>
    nthPaymentDate(next, subscription.billingCycle, n),
  );
  const trial = getTrialStatus(subscription.trialEndsAt, today);
  const emailEnabled = getEmailConfig() !== null;

  const reminderDates = [
    { label: "przed płatnością", date: reminderSendDate(next, profile.daysBefore), event: next },
    ...(trial && trial.daysLeft >= 0
      ? [{ label: "przed końcem okresu próbnego", date: reminderSendDate(trial.endsAt, profile.daysBefore), event: trial.endsAt }]
      : []),
  ];

  return (
    <>
      <PageHeader
        back={
          <Link href="/panel/subskrypcje" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            <ArrowLeft className="size-4" aria-hidden /> Subskrypcje
          </Link>
        }
        title={
          <span className="flex items-center gap-3">
            <ServiceAvatar name={subscription.name} className="size-11" />
            <span className="min-w-0 truncate">{subscription.name}</span>
            {!active && <Badge>anulowana</Badge>}
          </span>
        }
        action={
          <>
            <ButtonLink href={`/panel/subskrypcje/${subscription.id}/edytuj`} variant="secondary">
              <Pencil className="size-4" aria-hidden /> Edytuj
            </ButtonLink>
            <DeleteSubscriptionButton id={subscription.id} name={subscription.name} />
          </>
        }
      />

      {query.zapisano === "1" && (
        <Alert tone="success" className="mb-4">
          Zapisano zmiany.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted">Kwota</p>
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-fg">
                  {formatAmount(subscription.amountCents, subscription.amountIsEstimate)}
                  <span className="text-base font-normal text-subtle"> / {BILLING_CYCLE_SUFFIX[subscription.billingCycle]}</span>
                </p>
              </div>
              {active && (
                <div className="text-right">
                  <p className="text-sm text-muted">Następna płatność</p>
                  <p className="flex items-center justify-end gap-2 font-medium text-fg">
                    {formatDateLong(next)} <DaysBadge days={daysBetween(today, next)} />
                  </p>
                </div>
              )}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-3">
              <Detail label="Cykl">{BILLING_CYCLE_LABELS[subscription.billingCycle]}</Detail>
              <Detail label="Miesięcznie">{formatPLN(monthlyCostCents(subscription.amountCents, subscription.billingCycle))}</Detail>
              <Detail label="Rocznie">{formatPLN(yearlyCostCents(subscription.amountCents, subscription.billingCycle))}</Detail>
              <Detail label="Kategoria">{subscription.category ? CATEGORY_LABELS[subscription.category] : "—"}</Detail>
              <Detail label="Waluta">PLN</Detail>
              <Detail label="Status">{active ? "Aktywna" : "Anulowana"}</Detail>
            </dl>
            {subscription.notes && (
              <p className="mt-5 whitespace-pre-line rounded-xl border border-line bg-surface-2 p-3 text-sm text-muted">{subscription.notes}</p>
            )}
          </Card>

          {trial && (
            <Card
              className={cn(
                "p-5",
                trial.urgency === "critical" && "border-danger/40 bg-danger/[0.05]",
                trial.urgency === "soon" && "border-warn/40 bg-warn/[0.05]",
              )}
            >
              <p className="flex items-center gap-2 font-semibold text-fg">
                <Hourglass className="size-5 text-warn" aria-hidden /> Trial Guard
              </p>
              {trial.urgency === "ended" ? (
                <p className="mt-2 text-sm text-muted">
                  Okres próbny zakończył się {formatDateLong(trial.endsAt)} ({formatRelativeDays(trial.daysLeft)}).
                </p>
              ) : (
                <>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-fg">
                    {trial.daysLeft} {pluralDays(trial.daysLeft)} <span className="text-base font-normal text-muted">do końca okresu próbnego</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Koniec: {formatDateLong(trial.endsAt)}. Potem {formatPLN(subscription.amountCents)} / {BILLING_CYCLE_SUFFIX[subscription.billingCycle]}.
                  </p>
                </>
              )}
              <p className="mt-3 text-xs leading-relaxed text-muted">{TRIAL_DISCLAIMER}</p>
            </Card>
          )}

          {active && (
            <Card>
              <CardHeader icon={<CalendarClock className="size-5" aria-hidden />} title="Kolejne terminy" />
              <ul className="mt-3 divide-y divide-line pb-2">
                {[next, ...following].map((date) => (
                  <li key={date} className="flex items-center justify-between px-5 py-2.5 text-sm">
                    <span className="text-fg">{formatDateLong(date)}</span>
                    <span className="tabular-nums text-muted">{formatAmount(subscription.amountCents, subscription.amountIsEstimate)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {active && (
            <Card className="p-5">
              <p className="flex items-center gap-2 font-semibold text-fg">
                <BellRing className="size-5 text-accent" aria-hidden /> Przypomnienia
              </p>
              {!profile.enabled ? (
                <p className="mt-2 text-sm text-muted">
                  Przypomnienia są wyłączone w{" "}
                  <Link href="/panel/ustawienia" className="text-accent hover:underline">
                    ustawieniach
                  </Link>
                  .
                </p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted">
                  {reminderDates.map((reminder) => (
                    <li key={reminder.label}>
                      E-mail {reminder.label}:{" "}
                      <span className="text-fg">
                        {compareISODates(reminder.date, today) <= 0 ? "w najbliższej wysyłce" : formatDateLong(reminder.date)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {!emailEnabled && (
                <p className="mt-3 rounded-lg border border-warn/30 bg-warn/[0.07] p-2.5 text-xs text-warn">
                  Wysyłka e-maili nie jest jeszcze skonfigurowana na tym serwerze — terminy są wyliczane, ale wiadomości nie są wysyłane.
                </p>
              )}
            </Card>
          )}
          <CancelAssistant subscription={subscription} />
        </div>
      </div>
    </>
  );
}
