import { Hourglass } from "lucide-react";
import Link from "next/link";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { cn } from "@/components/ui/cn";
import { formatRelativeDaysTitle, formatWeekdayDayMonth } from "@/lib/dates";
import { formatAmount, formatPLN } from "@/lib/money";
import { NEAR_PAYMENT_DAYS, type ScheduleEvent } from "@/lib/subscriptions/schedule";

/** Upcoming payments and trial ends, each with the day written out ("Jutro · piątek, 16 października"). */
export function UpcomingList({ events }: { events: ScheduleEvent[] }) {
  return (
    <ul className="divide-y divide-line">
      {events.map((event) => {
        const near = event.daysUntil >= 0 && event.daysUntil <= NEAR_PAYMENT_DAYS;
        const isTrial = event.kind === "trial_end";
        return (
          <li key={`${event.subscription.id}-${event.kind}-${event.date}`}>
            <Link
              href={`/panel/subskrypcje/${event.subscription.id}`}
              className={cn("flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2", near && "bg-accent/[0.04]")}
            >
              <ServiceAvatar name={event.subscription.name} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-fg">{event.subscription.name}</p>
                <p className={cn("flex items-center gap-1.5 text-sm", near ? "font-medium text-accent" : "text-muted")}>
                  {isTrial && <Hourglass className="size-3.5 shrink-0 text-warn" aria-hidden />}
                  <span>
                    {formatRelativeDaysTitle(event.daysUntil)} · {formatWeekdayDayMonth(event.date)}
                    {isTrial && " — koniec darmowego okresu"}
                  </span>
                </p>
              </div>
              <span className="shrink-0 text-right text-base font-semibold tabular-nums text-fg">
                {isTrial ? (
                  <>
                    <span className="block text-xs font-normal text-muted">potem</span>
                    {formatPLN(event.subscription.amountCents)}
                  </>
                ) : (
                  formatAmount(event.subscription.amountCents, event.subscription.amountIsEstimate)
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
