import { BookOpen, CopyCheck, Layers } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { setSubscriptionStatus } from "@/actions/subscriptions";
import { PageHeader } from "@/components/app/page-header";
import { SavingsCounter } from "@/components/savings/savings-counter";
import { TipCard } from "@/components/savings/tip-card";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { getSavingsPrefs } from "@/lib/data/savings";
import { listSubscriptions } from "@/lib/data/subscriptions";
import { formatPLN } from "@/lib/money";
import { cancelGuideSlug } from "@/lib/savings/guides";
import { findOverlaps, overlapHint, overlapTitle } from "@/lib/savings/overlaps";
import { computeSavings, priciestOptional } from "@/lib/savings/savings";
import { yearlyCostCents } from "@/lib/subscriptions/billing";

export const metadata: Metadata = { title: "Oszczędzaj" };

export default async function SavingsPage() {
  const [subscriptions, prefs] = await Promise.all([listSubscriptions(), getSavingsPrefs()]);
  const savings = computeSavings(subscriptions);
  const dismissed = new Set(prefs.dismissedTips);
  const overlaps = findOverlaps(subscriptions).filter((o) => !dismissed.has(o.key));
  const priciest = priciestOptional(subscriptions);

  return (
    <>
      <PageHeader title="Oszczędzaj" description="Tu Opłacik szuka pieniędzy, które uciekają w stałych opłatach." />
      <div className="flex flex-col gap-6">
        <SavingsCounter savings={savings} />

        <section aria-labelledby="tips-heading">
          <h2 id="tips-heading" className="mb-3 text-lg font-semibold text-fg">
            Do sprawdzenia {overlaps.length > 0 && <span className="text-muted">({overlaps.length})</span>}
          </h2>
          {overlaps.length === 0 ? (
            <Card className="p-5 text-sm leading-relaxed text-muted" data-testid="no-tips">
              Na razie nic podejrzanego. Sprawdzamy, czy nie płacisz dwa razy za to samo (np. dwie chmury na zdjęcia albo dwa
              serwisy z muzyką). Im więcej opłat dodasz, tym więcej znajdziemy.
            </Card>
          ) : (
            <ul className="flex flex-col gap-3">
              {overlaps.map((overlap) => {
                const yearly = overlap.subscriptions.reduce((sum, s) => sum + yearlyCostCents(s.amountCents, s.billingCycle), 0);
                return (
                  <TipCard
                    key={overlap.key}
                    tipKey={overlap.key}
                    icon={overlap.kind === "same" ? <CopyCheck className="size-5" aria-hidden /> : <Layers className="size-5" aria-hidden />}
                    title={overlapTitle(overlap)}
                    canDismiss={prefs.ready}
                    actions={overlap.subscriptions.map((s) => (
                      <ButtonLink key={s.id} href={`/panel/subskrypcje/${s.id}`} variant="secondary" size="sm">
                        {s.name} · {formatPLN(s.amountCents)}
                      </ButtonLink>
                    ))}
                  >
                    <p>
                      Razem <strong className="tabular-nums text-fg">{formatPLN(yearly)} rocznie</strong>. {overlapHint(overlap)}
                    </p>
                  </TipCard>
                );
              })}
            </ul>
          )}
        </section>

        {priciest.length > 0 && (
          <Card data-testid="priciest">
            <CardHeader
              title="Najdroższe usługi, z których łatwo zrezygnować"
              description="Bez czynszu, prądu, telefonu i ubezpieczeń. Czy wszystkie są Ci dalej potrzebne?"
            />
            <ul className="mt-3 divide-y divide-line">
              {priciest.map(({ subscription, yearlyCents }) => {
                const guide = cancelGuideSlug(subscription.name);
                return (
                  <li key={subscription.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={`/panel/subskrypcje/${subscription.id}`} className="flex min-w-0 items-center gap-3">
                      <ServiceAvatar name={subscription.name} className="size-10" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-fg">{subscription.name}</span>
                        <span className="text-sm tabular-nums text-muted">{formatPLN(yearlyCents)} rocznie</span>
                      </span>
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      {guide && (
                        <ButtonLink href={`/jak-anulowac/${guide}`} variant="ghost" size="sm">
                          <BookOpen className="size-4" aria-hidden /> Jak zrezygnować
                        </ButtonLink>
                      )}
                      <form action={setSubscriptionStatus.bind(null, subscription.id, "cancelled")}>
                        <SubmitButton variant="secondary" size="sm" pendingText="Zapisuję…">
                          Zrezygnowałem
                        </SubmitButton>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-line px-5 py-3 text-xs leading-relaxed text-subtle">
              Opłacik niczego nie anuluje sam. Najpierw zrezygnuj u dostawcy, potem kliknij „Zrezygnowałem”, a kwota trafi do licznika.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
