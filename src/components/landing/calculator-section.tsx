import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { CostCalculator } from "./cost-calculator";

export function CalculatorSection() {
  return (
    <section id="kalkulator" className="scroll-mt-20 border-t border-line/60 bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-accent">Kalkulator — bez rejestracji</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Ile naprawdę płacisz za subskrypcje?</h2>
            <p className="mt-3 text-muted">Wpisz kwoty swoich usług. Suma miesięczna i roczna przeliczy się natychmiast.</p>
          </div>
          <ButtonLink href="/rejestracja" variant="secondary" className="self-start md:self-auto">
            Zapisz je na stałe <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
        <CostCalculator />
      </div>
    </section>
  );
}
