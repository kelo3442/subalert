import { Hourglass } from "lucide-react";
import Link from "next/link";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { cn } from "@/components/ui/cn";
import { formatDateShort, formatWeekday } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import { NEAR_PAYMENT_DAYS, type ScheduleEvent } from "@/lib/subscriptions/schedule";
import { DaysBadge } from "./days-badge";

export function UpcomingList({ events, showWeekday = false }: { events: ScheduleEvent[]; showWeekday?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {events.map((event) => {
        const near = event.daysUntil >= 0 && event.daysUntil <= NEAR_PAYMENT_DAYS;
        const isTrial = event.kind === "trial_end";
        return (
          <li key={`${event.subscription.id}-${event.kind}-${event.date}`}>
            <Link
              href={`/panel/subskrypcje/${event.subscription.id}`}
              className={cn(
                "flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2",
                near && "bg-accent/[0.035]",
              )}
            >
              <ServiceAvatar name={event.subscription.name} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">{event.subscription.name}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted">
                  {isTrial && <Hourglass className="size-3 text-warn" aria-hidden />}
                  {isTrial ? "Koniec okresu próbnego" : "Płatność"} · {formatDateShort(event.date)}
                  {showWeekday && `, ${formatWeekday(event.date)}`}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-medium tabular-nums text-fg">
                  {isTrial ? `potem ${formatPLN(event.subscription.amountCents)}` : formatPLN(event.subscription.amountCents)}
                </span>
                <DaysBadge days={event.daysUntil} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
