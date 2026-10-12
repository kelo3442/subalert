import { Hourglass, Info } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { formatDateLong, formatRelativeDays, pluralDays, type ISODate } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import { BILLING_CYCLE_SUFFIX } from "@/lib/subscriptions/billing";
import { getTrialStatus } from "@/lib/subscriptions/trials";
import type { Subscription } from "@/lib/subscriptions/types";

export const TRIAL_DISCLAIMER =
  "Przypomnienie nie anuluje subskrypcji automatycznie. Jeśli nie chcesz płacić, anuluj usługę u dostawcy przed końcem okresu próbnego.";

export function TrialGuardPanel({ trials, today }: { trials: Subscription[]; today: ISODate }) {
  return (
    <section aria-labelledby="trial-guard-title" className="rounded-2xl border border-warn/30 bg-gradient-to-br from-warn/[0.08] to-surface">
      <div className="flex items-center gap-2 px-5 pt-5">
        <Hourglass className="size-5 text-warn" aria-hidden />
        <h2 id="trial-guard-title" className="font-semibold text-fg">
          Trial Guard
        </h2>
        <Badge tone="warn">{trials.length}</Badge>
      </div>
      <ul className="mt-3 grid gap-2 px-3 sm:grid-cols-2">
        {trials.map((subscription) => {
          const status = getTrialStatus(subscription.trialEndsAt, today)!;
          const critical = status.urgency === "critical";
          return (
            <li key={subscription.id}>
              <Link
                href={`/panel/subskrypcje/${subscription.id}`}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-3 transition-colors hover:border-line-strong",
                  critical ? "border-danger/30 bg-danger/[0.06]" : "border-line bg-surface/80",
                )}
              >
                <div className={cn("grid size-14 shrink-0 place-items-center rounded-xl border text-center", critical ? "border-danger/30 text-danger" : "border-warn/30 text-warn")}>
                  <div>
                    <p className="text-xl font-semibold leading-none tabular-nums">{status.daysLeft}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wide">{pluralDays(status.daysLeft)}</p>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-fg">{subscription.name}</p>
                  <p className="text-xs text-muted">
                    Koniec {formatRelativeDays(status.daysLeft)} · {formatDateLong(status.endsAt)}
                  </p>
                  <p className="text-xs text-muted">
                    Potem {formatPLN(subscription.amountCents)} / {BILLING_CYCLE_SUFFIX[subscription.billingCycle]}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="flex items-start gap-2 px-5 pb-5 pt-3 text-xs leading-relaxed text-muted">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        {TRIAL_DISCLAIMER}
      </p>
    </section>
  );
}
