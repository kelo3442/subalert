import { PricingCards } from "@/components/premium/pricing-cards";
import { ButtonLink } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section id="cennik" className="scroll-mt-20 border-t border-line/60 bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-medium text-accent">Cennik</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Zacznij za darmo</h2>
          <p className="mt-3 text-muted">Bez karty przy rejestracji. Na Premium przejdziesz, kiedy zechcesz.</p>
        </div>
        <PricingCards
          freeAction={
            <ButtonLink href="/rejestracja" variant="secondary" className="w-full">
              Załóż darmowe konto
            </ButtonLink>
          }
          monthlyAction={
            <ButtonLink href="/rejestracja" className="w-full">
              Zacznij
            </ButtonLink>
          }
          yearlyAction={
            <ButtonLink href="/rejestracja" className="w-full">
              Zacznij
            </ButtonLink>
          }
        />
      </div>
    </section>
  );
}
