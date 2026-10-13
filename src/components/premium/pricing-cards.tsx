import { Check, Crown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { FREE_PLAN_LIMIT } from "@/lib/premium/plan";

const FREE_FEATURES = [
  `Do ${FREE_PLAN_LIMIT} subskrypcji lub rachunków`,
  "Koszty miesięczne i roczne, kalendarz płatności",
  "Trial Guard i przypomnienia e-mail",
  "Wyszukiwanie w pliku z historii konta",
  "Eksport danych",
];

const PREMIUM_FEATURES = [
  "Bez limitu subskrypcji i rachunków",
  "Automatyczne dodawanie z przekazanych e-maili",
  "Wszystko z planu darmowego",
];

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-muted">
          <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Free vs Premium; the call-to-action slots differ between the landing page and the app. */
export function PricingCards({
  freeAction,
  monthlyAction,
  yearlyAction,
  current,
  soon = false,
}: {
  freeAction?: ReactNode;
  monthlyAction?: ReactNode;
  yearlyAction?: ReactNode;
  current?: "free" | "premium";
  /** Premium is announced but cannot be bought yet. */
  soon?: boolean;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <div
        className={cn(
          "order-2 flex flex-col rounded-3xl border bg-surface p-6 lg:order-1",
          current === "free" ? "border-line-strong" : "border-line",
        )}
      >
        <p className="text-sm font-medium text-muted">Darmowy</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-fg">0 zł</p>
        <p className="mt-1 text-sm text-subtle">na zawsze</p>
        <FeatureList items={FREE_FEATURES} />
        <div className="mt-auto pt-6">{freeAction}</div>
      </div>

      <div className="relative order-1 flex flex-col overflow-hidden rounded-3xl border-2 border-accent/50 lg:order-2 bg-gradient-to-b from-accent/[0.10] to-surface p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-accent">
          <Crown className="size-4" aria-hidden /> Premium
          {soon && (
            <span
              className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-semibold"
              data-testid="premium-soon"
            >
              Wkrótce
            </span>
          )}
        </p>
        {soon && <p className="mt-1 text-xs text-subtle">Planowane ceny — zakup będzie możliwy po starcie Premium.</p>}
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-bg/60 p-4">
            <p className="text-3xl font-semibold tracking-tight text-fg">
              9,99 zł <span className="text-base font-normal text-muted">/ mies.</span>
            </p>
            <p className="mt-1 text-xs text-subtle">Karta, odnawiane co miesiąc. Anulujesz w każdej chwili.</p>
            {monthlyAction && <div className="mt-4">{monthlyAction}</div>}
          </div>
          <div className="rounded-2xl border border-accent/40 bg-bg/60 p-4">
            <p className="text-3xl font-semibold tracking-tight text-fg">
              79 zł <span className="text-base font-normal text-muted">/ rok</span>
            </p>
            <p className="mt-1 text-xs text-subtle">
              BLIK, Przelewy24 lub karta. Płacisz raz — <strong className="text-muted">bez automatycznego odnawiania</strong>. Taniej o ok.
              34%.
            </p>
            {yearlyAction && <div className="mt-4">{yearlyAction}</div>}
          </div>
        </div>
        <FeatureList items={PREMIUM_FEATURES} />
      </div>
    </div>
  );
}
