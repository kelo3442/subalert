import { ArrowRight, BellRing, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EarlyAccessBanner } from "./early-access-banner";
import { ProductPreview } from "./product-preview";

export function Hero({ earlyAccessPlaces }: { earlyAccessPlaces: number | null }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:pb-24">
        <div className="animate-fade-up">
          <EarlyAccessBanner placesLeft={earlyAccessPlaces} className="mb-6 max-w-xl" />
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
            <BellRing className="size-3.5 text-accent" aria-hidden />
            Subskrypcje i rachunki domowe w jednym miejscu
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-fg sm:text-5xl lg:text-[3.5rem]">
            Wszystkie stałe opłaty w jednym miejscu.{" "}
            <span className="text-accent">Z każdego banku.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Netflix, Spotify, siłownia, ale też prąd, czynsz czy internet. Opłacik przypomni, zanim zapłacisz, pokaże, ile
            to kosztuje w skali miesiąca i roku, i da znać, gdy coś podrożeje.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/rejestracja" size="lg">
              Zacznij kontrolować wydatki
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="#kalkulator" variant="secondary" size="lg">
              Policz swoje subskrypcje
            </ButtonLink>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-subtle">
            <ShieldCheck className="size-4 text-accent" aria-hidden />
            Bez podpinania konta bankowego. Sam decydujesz, co zapisujesz.
          </p>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}
