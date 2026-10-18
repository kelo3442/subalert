import { Hourglass } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { formatRelativeDays, formatWeekdayDayMonth, type ISODate } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import { BILLING_CYCLE_LABELS } from "@/lib/subscriptions/billing";
import { getTrialStatus } from "@/lib/subscriptions/trials";
import type { Subscription } from "@/lib/subscriptions/types";

export const TRIAL_DISCLAIMER =
  "Opłacik nie anuluje usługi sam. Jeśli nie chcesz płacić, zrezygnuj u dostawcy przed końcem darmowego okresu.";

/** Warning about free trials that are about to turn into payments, written as plain sentences. */
export function TrialGuardPanel({ trials, today }: { trials: Subscription[]; today: ISODate }) {
  return (
    <section aria-labelledby="trial-guard-title" className="rounded-2xl border-2 border-warn/40 bg-warn/[0.07] p-5">
      <h2 id="trial-guard-title" className="flex items-center gap-2 text-lg font-semibold text-warn">
        <Hourglass className="size-5" aria-hidden />
        {trials.length === 1 ? "Uwaga: kończy się darmowy okres" : `Uwaga: kończą się darmowe okresy (${trials.length})`}
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {trials.map((subscription) => {
          const status = getTrialStatus(subscription.trialEndsAt, today)!;
          const critical = status.urgency === "critical";
          return (
            <li key={subscription.id} className={cn("rounded-xl border bg-surface/70 p-4", critical ? "border-danger/40" : "border-warn/30")}>
              <p className="text-base leading-relaxed text-fg">
                Darmowy okres <strong className="font-semibold">{subscription.name}</strong> kończy się{" "}
                <strong className={cn("font-semibold", critical && "text-danger")}>{formatRelativeDays(status.daysLeft)}</strong> (
                {formatWeekdayDayMonth(status.endsAt)}). Potem zapłacisz{" "}
                <strong className="font-semibold">
                  {formatPLN(subscription.amountCents)} {BILLING_CYCLE_LABELS[subscription.billingCycle].toLowerCase()}
                </strong>
                .
              </p>
              <Link href={`/panel/subskrypcje/${subscription.id}`} className={cn(buttonClasses("secondary", "md"), "mt-3 w-full sm:w-auto")}>
                Jak zrezygnować?
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-muted">{TRIAL_DISCLAIMER}</p>
    </section>
  );
}
