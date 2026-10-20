import { BadgePercent, BookOpen, Car, CopyCheck, FileText, Layers, MoonStar, PhoneCall } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { setSubscriptionStatus } from "@/actions/subscriptions";
import { PageHeader } from "@/components/app/page-header";
import { PaydayCard } from "@/components/savings/payday-card";
import { SavingsCounter } from "@/components/savings/savings-counter";
import { TipCard } from "@/components/savings/tip-card";
import { UsageQuestions } from "@/components/savings/usage-questions";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { getSavingsPrefs, listUsageAnswers } from "@/lib/data/savings";
import { listSubscriptions } from "@/lib/data/subscriptions";
import { getUserProfile } from "@/lib/data/user";
import { daysBetween, formatDateLong, todayInTimeZone } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import { cancelGuideSlug } from "@/lib/savings/guides";
import { cheaperOffers, isCarInsurance } from "@/lib/savings/offers";
import { findOverlaps, overlapHint, overlapTitle } from "@/lib/savings/overlaps";
import { computeSavings, priciestOptional } from "@/lib/savings/savings";
import { unusedPlans, usageQuestions } from "@/lib/savings/usage";
import { yearlyCostCents } from "@/lib/subscriptions/billing";
import { nextPaymentDate } from "@/lib/subscriptions/schedule";

export const metadata: Metadata = { title: "Oszczędzaj" };

export default async function SavingsPage() {
  const [subscriptions, prefs, answers, profile] = await Promise.all([
    listSubscriptions(),
    getSavingsPrefs(),
    listUsageAnswers(),
    getUserProfile(),
  ]);
  const today = todayInTimeZone(profile.timeZone);
  const savings = computeSavings(subscriptions);
  const dismissed = new Set(prefs.dismissedTips);
  const overlaps = findOverlaps(subscriptions).filter((o) => !dismissed.has(o.key));
  const unused = unusedPlans(subscriptions, answers, today)
    .map((u) => ({ ...u, key: `unused:${u.subscription.id},${u.month}` }))
    .filter((u) => !dismissed.has(u.key));
  const questions = prefs.ready ? usageQuestions(subscriptions, answers, today) : [];
  const cheaper = cheaperOffers(subscriptions).filter((t) => !dismissed.has(t.key));
  const active = subscriptions.filter((s) => s.status === "active");
  // OC renews itself for another 12 months: show it from two months before the renewal.
  const carInsurance = active
    .filter(isCarInsurance)
    .map((s) => ({ subscription: s, renews: nextPaymentDate(s, today) }))
    .filter(({ renews }) => daysBetween(today, renews) <= 60)
    .map((x) => ({ ...x, key: `oc:${x.subscription.id},${x.renews}` }))
    .filter((x) => !dismissed.has(x.key));
  const telecom = active
    .filter((s) => s.category === "telecom")
    .map((s) => ({ subscription: s, key: `telecom:${s.id}` }))
    .filter((x) => !dismissed.has(x.key));
  const tipCount = overlaps.length + unused.length + cheaper.length + carInsurance.length + telecom.length;
  const priciest = priciestOptional(subscriptions);

  return (
    <>
      <PageHeader title="Oszczędzaj" description="Tu Opłacik szuka pieniędzy, które uciekają w stałych opłatach." />
      <div className="flex flex-col gap-6">
        <SavingsCounter savings={savings} />
        <UsageQuestions questions={questions} />

        <section aria-labelledby="tips-heading">
          <h2 id="tips-heading" className="mb-3 text-lg font-semibold text-fg">
            Do sprawdzenia {tipCount > 0 && <span className="text-muted">({tipCount})</span>}
          </h2>
          {tipCount === 0 ? (
            <Card className="p-5 text-sm leading-relaxed text-muted" data-testid="no-tips">
              Na razie nic podejrzanego. Sprawdzamy, czy nie płacisz dwa razy za to samo (np. dwie chmury na zdjęcia albo dwa
              serwisy z muzyką). Im więcej opłat dodasz, tym więcej znajdziemy.
            </Card>
          ) : (
            <ul className="flex flex-col gap-3">
              {carInsurance.map(({ subscription, renews, key }) => (
                <TipCard
                  key={key}
                  tipKey={key}
                  icon={<Car className="size-5" aria-hidden />}
                  title={`${subscription.name} odnowi się samo ${formatDateLong(renews)}`}
                  canDismiss={prefs.ready}
                  actions={
                    <ButtonLink href={`/panel/oszczedzaj/wypowiedzenie?typ=oc&id=${subscription.id}`} variant="secondary" size="sm">
                      <FileText className="size-4" aria-hidden /> Napisz wypowiedzenie
                    </ButtonLink>
                  }
                >
                  <p>
                    Umowa OC przedłuża się automatycznie na kolejne 12 miesięcy, jeśli jej nie wypowiesz. Najpóźniej 14 dni przed końcem
                    ubezpieczyciel musi przysłać informację o składce na kolejny rok. Porównaj ją z ofertami innych firm. Jeśli znajdziesz
                    taniej, wypowiedz obecną umowę przed jej końcem, najlepiej z kilkudniowym zapasem.
                  </p>
                </TipCard>
              ))}
              {cheaper.map(({ key, offer, subscription }) => (
                <TipCard
                  key={key}
                  tipKey={key}
                  icon={<BadgePercent className="size-5" aria-hidden />}
                  title={offer.title}
                  canDismiss={prefs.ready}
                  actions={
                    <ButtonLink href={offer.source} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
                      Cennik u dostawcy
                    </ButtonLink>
                  }
                >
                  <p>{offer.body}</p>
                  {offer.yearlySavingCents !== null && (
                    <p className="mt-1">
                      Przy obecnej cenie ({subscription.name}) oszczędzisz{" "}
                      <strong className="tabular-nums text-fg">{formatPLN(offer.yearlySavingCents)} rocznie</strong>.
                    </p>
                  )}
                  <p className="mt-1 text-xs text-subtle">Ceny sprawdzone {formatDateLong(offer.verifiedAt)}. Aktualne zawsze w cenniku dostawcy.</p>
                </TipCard>
              ))}
              {telecom.map(({ subscription, key }) => (
                <TipCard
                  key={key}
                  tipKey={key}
                  icon={<PhoneCall className="size-5" aria-hidden />}
                  title={`${subscription.name}: zapytaj o lepszą ofertę`}
                  canDismiss={prefs.ready}
                  actions={
                    <ButtonLink href={`/panel/oszczedzaj/wypowiedzenie?id=${subscription.id}`} variant="secondary" size="sm">
                      <FileText className="size-4" aria-hidden /> Wypowiedzenie
                    </ButtonLink>
                  }
                >
                  <p>Operatorzy często mają lepsze ceny dla nowych klientów. Jedna rozmowa może obniżyć rachunek.</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium text-fg">Co powiedzieć — ściąga</summary>
                    <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5">
                      <li>Sprawdź, kiedy kończy się Twoja umowa (w umowie albo w aplikacji operatora).</li>
                      <li>Zobacz aktualne oferty dla nowych klientów u swojego operatora i u konkurencji.</li>
                      <li>Zadzwoń lub napisz: „Rozważam przejście do innej sieci. Jaką ofertę możecie mi zaproponować, żebym został?”</li>
                      <li>Numer telefonu możesz zabrać do innej sieci, więc masz w czym wybierać.</li>
                      <li>Nie zgadzaj się od razu. Poproś o ofertę mailem i porównaj ją z innymi.</li>
                    </ol>
                  </details>
                </TipCard>
              ))}
              {unused.map(({ subscription, months, key }) => {
                const guide = cancelGuideSlug(subscription.name);
                return (
                  <TipCard
                    key={key}
                    tipKey={key}
                    icon={<MoonStar className="size-5" aria-hidden />}
                    title={months >= 2 ? `Od ${months} miesięcy nie korzystasz z: ${subscription.name}` : `Nie korzystasz z: ${subscription.name}`}
                    canDismiss={prefs.ready}
                    actions={
                      <>
                        <ButtonLink href={guide ? `/jak-anulowac/${guide}` : `/panel/subskrypcje/${subscription.id}`} variant="secondary" size="sm">
                          <BookOpen className="size-4" aria-hidden /> Jak zrezygnować
                        </ButtonLink>
                        <form action={setSubscriptionStatus.bind(null, subscription.id, "cancelled")}>
                          <SubmitButton variant="secondary" size="sm" pendingText="Zapisuję…">
                            Zrezygnowałem
                          </SubmitButton>
                        </form>
                      </>
                    }
                  >
                    <p>
                      Rezygnując, oszczędzisz{" "}
                      <strong className="tabular-nums text-fg">
                        {formatPLN(yearlyCostCents(subscription.amountCents, subscription.billingCycle))} rocznie
                      </strong>
                      . Gdy znów będzie potrzebna, zwykle da się ją włączyć w kilka minut.
                    </p>
                  </TipCard>
                );
              })}
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

        <PaydayCard subscriptions={subscriptions} today={today} payday={prefs.payday} ready={prefs.ready} />

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
                      {!guide && subscription.category === "fitness" && (
                        <ButtonLink href={`/panel/oszczedzaj/wypowiedzenie?id=${subscription.id}`} variant="ghost" size="sm">
                          <FileText className="size-4" aria-hidden /> Wypowiedzenie
                        </ButtonLink>
                      )}
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
