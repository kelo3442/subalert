import { ArrowRight, Gift } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { EARLY_ACCESS_LIMIT, EARLY_ACCESS_MONTHS, placesWord } from "@/lib/premium/plan";

function peopleWord(n: number): string {
  if (n === 1) return "osoba odebrała";
  const few = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
  return few ? "osoby odebrały" : "osób odebrało";
}

/**
 * Launch promotion with a live counter of claimed places; hidden once every
 * place is taken. The count comes from the database, so it is always real.
 */
export function EarlyAccessBanner({ placesLeft, className }: { placesLeft: number | null; className?: string }) {
  if (placesLeft === 0) return null;
  const claimed = placesLeft === null ? null : EARLY_ACCESS_LIMIT - placesLeft;
  return (
    <div
      className={cn("rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm leading-relaxed text-fg", className)}
      data-testid="early-access-banner"
    >
      <p className="flex items-start gap-2.5">
        <Gift className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <span>
          <strong className="font-semibold">
            Pierwsze {EARLY_ACCESS_LIMIT} osób dostaje Premium za darmo na {EARLY_ACCESS_MONTHS} miesięcy.
          </strong>{" "}
          Wystarczy założyć konto i potwierdzić e-mail. Bez karty i bez opłat po tym czasie.
        </span>
      </p>
      {claimed !== null && placesLeft !== null && (
        <div className="mt-3" data-testid="early-access-counter">
          <div className="flex items-baseline justify-between gap-3">
            <p>
              <strong className="text-lg font-semibold tabular-nums text-fg">
                {claimed} / {EARLY_ACCESS_LIMIT}
              </strong>{" "}
              <span className="text-muted">{peopleWord(claimed)}</span>
            </p>
            <p className="shrink-0 text-muted">
              zostało <strong className="font-semibold tabular-nums text-accent">{placesLeft}</strong> {placesWord(placesLeft)}
            </p>
          </div>
          <div
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-3"
            role="progressbar"
            aria-label="Odebrane miejsca"
            aria-valuemin={0}
            aria-valuemax={EARLY_ACCESS_LIMIT}
            aria-valuenow={claimed}
          >
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.max(2, (claimed / EARLY_ACCESS_LIMIT) * 100)}%` }}
            />
          </div>
        </div>
      )}
      <Link
        href="/rejestracja"
        className="mt-3 inline-flex items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline"
      >
        Załóż konto i odbierz <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
