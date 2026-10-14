import { PricingCards } from "@/components/premium/pricing-cards";
import { ButtonLink } from "@/components/ui/button";
import { isPremiumSalesOpen } from "@/lib/env";

export function PricingSection() {
  const salesOpen = isPremiumSalesOpen();
  return (
    <section id="cennik" className="scroll-mt-20 border-t border-line/60 bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-medium text-accent">Cennik</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Zacznij za darmo</h2>
          <p className="mt-3 text-muted">
            {salesOpen
              ? "Bez karty przy rejestracji. Na Premium przejdziesz, kiedy zechcesz."
              : "Bez karty przy rejestracji. Premium startuje wkrótce — po założeniu konta możesz zapisać się na listę chętnych."}
          </p>
        </div>
        <PricingCards
          soon={!salesOpen}
          freeAction={
            <ButtonLink href="/rejestracja" variant="secondary" className="w-full">
              Załóż darmowe konto
            </ButtonLink>
          }
          monthlyAction={
            salesOpen ? (
              <ButtonLink href="/rejestracja" className="w-full">
                Zacznij
              </ButtonLink>
            ) : null
          }
          yearlyAction={
            salesOpen ? (
              <ButtonLink href="/rejestracja" className="w-full">
                Zacznij
              </ButtonLink>
            ) : null
          }
        />
      </div>
    </section>
  );
}
