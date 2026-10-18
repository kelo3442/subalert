import { Gift } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { EARLY_ACCESS_LIMIT, EARLY_ACCESS_MONTHS } from "@/lib/premium/plan";

function placesWord(n: number): string {
  if (n === 1) return "miejsce";
  const few = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
  return few ? "miejsca" : "miejsc";
}

/** Launch promotion notice; hidden once every place is taken. */
export function EarlyAccessBanner({ placesLeft, className }: { placesLeft: number | null; className?: string }) {
  if (placesLeft === 0) return null;
  return (
    <p
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm leading-relaxed text-fg",
        className,
      )}
      data-testid="early-access-banner"
    >
      <Gift className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
      <span>
        <strong className="font-semibold">Na start: pierwsze {EARLY_ACCESS_LIMIT} osób dostaje Premium za darmo na {EARLY_ACCESS_MONTHS} miesięcy.</strong>{" "}
        Bez karty i bez opłat po tym czasie.
        {placesLeft !== null && (
          <>
            {" "}
            Zostało <strong className="font-semibold text-accent">{placesLeft}</strong> {placesWord(placesLeft)}.
          </>
        )}
      </span>
    </p>
  );
}
