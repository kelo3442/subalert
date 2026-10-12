import { Hourglass } from "lucide-react";
import Link from "next/link";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { cn } from "@/components/ui/cn";
import { formatMonthYear, formatRelativeDays, formatWeekday, type ISODate } from "@/lib/dates";
import { formatPLN } from "@/lib/money";
import { NEAR_PAYMENT_DAYS, type ScheduleEvent } from "@/lib/subscriptions/schedule";

interface DayGroup {
  date: ISODate;
  daysUntil: number;
  events: ScheduleEvent[];
}

interface MonthGroup {
  key: string;
  label: string;
  totalCents: number;
  days: DayGroup[];
}

function groupByMonth(events: ScheduleEvent[]): MonthGroup[] {
  const months: MonthGroup[] = [];
  for (const event of events) {
    const key = event.date.slice(0, 7);
    let month = months.at(-1);
    if (!month || month.key !== key) {
      month = { key, label: formatMonthYear(event.date), totalCents: 0, days: [] };
      months.push(month);
    }
    let day = month.days.at(-1);
    if (!day || day.date !== event.date) {
      day = { date: event.date, daysUntil: event.daysUntil, events: [] };
      month.days.push(day);
    }
    day.events.push(event);
    if (event.kind === "payment") month.totalCents += event.subscription.amountCents;
  }
  return months;
}

export function CalendarAgenda({ events }: { events: ScheduleEvent[] }) {
  return (
    <div className="flex flex-col gap-8">
      {groupByMonth(events).map((month) => (
        <section key={month.key} aria-labelledby={`month-${month.key}`}>
          <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
            <h2 id={`month-${month.key}`} className="text-lg font-semibold capitalize text-fg">
              {month.label}
            </h2>
            <p className="text-sm tabular-nums text-muted">
              Płatności: <span className="font-medium text-fg">{formatPLN(month.totalCents)}</span>
            </p>
          </div>
          <ol className="flex flex-col gap-2">
            {month.days.map((day) => {
              const near = day.daysUntil <= NEAR_PAYMENT_DAYS;
              return (
                <li
                  key={day.date}
                  className={cn(
                    "flex gap-3 rounded-2xl border p-3 sm:gap-4 sm:p-4",
                    near ? "border-accent/35 bg-accent/[0.05]" : "border-line bg-surface",
                  )}
                >
                  <div className={cn("flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border py-2", near ? "border-accent/40 text-accent" : "border-line text-fg")}>
                    <span className="text-xl font-semibold leading-none tabular-nums">{Number(day.date.slice(8, 10))}</span>
                    <span className="mt-1 text-[10px] uppercase tracking-wide text-muted">{formatWeekday(day.date).slice(0, 3)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("mb-1.5 text-xs font-medium", near ? "text-accent" : "text-subtle")}>{formatRelativeDays(day.daysUntil)}</p>
                    <ul className="flex flex-col gap-1.5">
                      {day.events.map((event) => (
                        <li key={`${event.subscription.id}-${event.kind}`}>
                          <Link href={`/panel/subskrypcje/${event.subscription.id}`} className="flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-80">
                            <ServiceAvatar name={event.subscription.name} className="size-7 rounded-lg text-xs" />
                            <span className="min-w-0 flex-1 truncate text-sm text-fg">
                              {event.subscription.name}
                              {event.kind === "trial_end" && (
                                <span className="ml-2 inline-flex items-center gap-1 text-xs text-warn">
                                  <Hourglass className="size-3" aria-hidden /> koniec okresu próbnego
                                </span>
                              )}
                            </span>
                            <span className={cn("shrink-0 text-sm tabular-nums", event.kind === "trial_end" ? "text-muted" : "text-fg")}>
                              {event.kind === "trial_end" ? "—" : formatPLN(event.subscription.amountCents)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
