import { ChevronRight, Hourglass } from "lucide-react";
import Link from "next/link";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { Badge } from "@/components/ui/badge";
import { daysBetween, formatDateShort, type ISODate } from "@/lib/dates";
import { formatAmount } from "@/lib/money";
import { BILLING_CYCLE_SUFFIX } from "@/lib/subscriptions/billing";
import { CATEGORY_LABELS } from "@/lib/subscriptions/categories";
import { nextPaymentDate } from "@/lib/subscriptions/schedule";
import { getTrialStatus } from "@/lib/subscriptions/trials";
import type { Subscription } from "@/lib/subscriptions/types";
import { DaysBadge } from "./days-badge";

export function SubscriptionList({ subscriptions, today }: { subscriptions: Subscription[]; today: ISODate }) {
  return (
    <ul className="divide-y divide-line">
      {subscriptions.map((subscription) => {
        const active = subscription.status === "active";
        const next = nextPaymentDate(subscription, today);
        const trial = getTrialStatus(subscription.trialEndsAt, today);
        return (
          <li key={subscription.id}>
            <Link href={`/panel/subskrypcje/${subscription.id}`} className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 sm:px-5">
              <ServiceAvatar name={subscription.name} className={active ? undefined : "opacity-50 grayscale"} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`truncate font-medium ${active ? "text-fg" : "text-muted line-through decoration-subtle"}`}>{subscription.name}</p>
                  {trial && trial.urgency !== "ended" && active && (
                    <Badge tone="warn">
                      <Hourglass className="size-3" aria-hidden /> próbny
                    </Badge>
                  )}
                  {!active && <Badge>anulowana</Badge>}
                </div>
                <p className="truncate text-xs text-muted">
                  {subscription.category ? CATEGORY_LABELS[subscription.category] : "Bez kategorii"}
                  {active && ` · następna ${formatDateShort(next)}`}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="text-sm font-medium tabular-nums text-fg">
                  {formatAmount(subscription.amountCents, subscription.amountIsEstimate)}
                  <span className="text-xs font-normal text-subtle"> / {BILLING_CYCLE_SUFFIX[subscription.billingCycle]}</span>
                </p>
                {active && <DaysBadge days={daysBetween(today, next)} />}
              </div>
              <ChevronRight className="hidden size-4 text-subtle transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
