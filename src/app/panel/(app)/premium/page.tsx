import { Crown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { openBillingPortal, startCheckout } from "@/actions/premium";
import { PageHeader } from "@/components/app/page-header";
import { PricingCards } from "@/components/premium/pricing-cards";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { getPlanStatus } from "@/lib/data/plan";
import { formatDateLong } from "@/lib/dates";
import { FREE_PLAN_LIMIT_MESSAGE } from "@/lib/premium/plan";
import { getStripeConfig } from "@/lib/premium/stripe";

export const metadata: Metadata = { title: "Premium" };

const NOTICES: Record<string, { tone: "success" | "info" | "error" | "warn"; text: string }> = {
  ok: { tone: "success", text: "Dziękujemy! Płatność została przyjęta — Premium włączy się w ciągu kilku chwil (odśwież stronę)." },
  anulowana: { tone: "info", text: "Płatność została przerwana. Nic nie zostało pobrane." },
  platnosc: { tone: "error", text: "Nie udało się połączyć z operatorem płatności. Spróbuj ponownie za chwilę." },
  konfiguracja: { tone: "warn", text: "Płatności nie są jeszcze skonfigurowane na tym serwerze." },
  limit: { tone: "warn", text: FREE_PLAN_LIMIT_MESSAGE },
};

export default async function PremiumPage({ searchParams }: PageProps<"/panel/premium">) {
  const [plan, params] = await Promise.all([getPlanStatus(), searchParams]);
  const paymentsReady = getStripeConfig() !== null;
  const key = [params.platnosc, params.blad, params.powod].find((value): value is string => typeof value === "string");
  const notice = key ? NOTICES[key] : undefined;

  const checkoutButton = (planKey: "monthly" | "yearly", label: string) =>
    paymentsReady ? (
      <form action={startCheckout.bind(null, planKey)}>
        <SubmitButton className="w-full" pendingText="Przekierowuję…">
          {label}
        </SubmitButton>
      </form>
    ) : null;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Crown className="size-7 text-accent" aria-hidden /> Premium
          </span>
        }
        description="Bez limitu pozycji i z automatycznym dodawaniem nowych subskrypcji z e-maili."
      />
      {notice && (
        <Alert tone={notice.tone} className="mb-4">
          {notice.text}
        </Alert>
      )}

      <div className="mb-6 rounded-2xl border border-line bg-surface p-5" data-testid="plan-status">
        {plan.premium ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-accent">Masz Premium</p>
              <p className="text-sm text-muted">
                {plan.premiumSource === "subscription" ? "Odnawia się automatycznie — kolejna płatność " : "Aktywne do "}
                {plan.premiumUntil && formatDateLong(plan.premiumUntil.slice(0, 10))}.
                {plan.premiumSource === "one_time" && " Nie odnawia się samo."}
              </p>
            </div>
            {plan.premiumSource === "subscription" && plan.hasStripeCustomer && paymentsReady && (
              <form action={openBillingPortal}>
                <SubmitButton variant="secondary" pendingText="Otwieram…">
                  Zarządzaj subskrypcją
                </SubmitButton>
              </form>
            )}
          </div>
        ) : (
          <div>
            <p className="font-semibold text-fg">Plan darmowy</p>
            <p className="text-sm text-muted">
              Aktywne pozycje: <strong className="text-fg">{plan.activeCount}</strong> z {plan.limit}.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3" aria-hidden>
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (plan.activeCount / plan.limit) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      <PricingCards
        current={plan.premium ? "premium" : "free"}
        monthlyAction={!plan.premium ? checkoutButton("monthly", "Wybieram miesięcznie") : null}
        yearlyAction={checkoutButton("yearly", plan.premium ? "Przedłuż o rok" : "Wybieram rok")}
      />
      {!paymentsReady && (
        <p className="mt-4 text-sm text-subtle">Płatności nie są jeszcze skonfigurowane na tym serwerze.</p>
      )}
      <p className="mt-6 text-xs leading-relaxed text-subtle">
        Płatności obsługuje Stripe. SubAlert nie widzi ani nie przechowuje danych Twojej karty. Ceny w złotych. Kupując, akceptujesz{" "}
        <Link href="/regulamin" className="text-accent hover:underline">
          regulamin
        </Link>{" "}
        — masz 14 dni na odstąpienie od umowy.
      </p>
    </div>
  );
}
