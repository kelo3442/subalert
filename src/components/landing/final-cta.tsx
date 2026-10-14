import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="border-t border-line/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-accent/[0.07] px-6 py-12 text-center sm:px-12">
          <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-[600px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
          <h2 className="relative text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Sprawdź, za co płacisz co miesiąc</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-muted">
            Załóż konto, dodaj subskrypcje i ustaw przypomnienia. Zajmie Ci to kilka minut.
          </p>
          <ButtonLink href="/rejestracja" size="lg" className="relative mt-8">
            Załóż konto <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
