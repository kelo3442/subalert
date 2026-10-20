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
            Sprawdź, czy nie płacisz za coś,{" "}
            <span className="text-accent">o czym zapomniałeś.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Wgraj historię konta z banku i w kilka sekund zobacz wszystkie stałe opłaty: subskrypcje, aplikacje, abonamenty i
            rachunki. Potem Opłacik przypomni przed każdą płatnością i da znać, gdy coś podrożeje.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/sprawdz" size="lg">
              Sprawdź swój wyciąg — bez konta
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/rejestracja" variant="secondary" size="lg">
              Załóż darmowe konto
            </ButtonLink>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-subtle">
            <ShieldCheck className="size-4 shrink-0 text-accent" aria-hidden />
            Bez podpinania konta bankowego. Plik nie opuszcza Twojego urządzenia.
          </p>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}
