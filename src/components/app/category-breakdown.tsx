import { formatPLN } from "@/lib/money";
import { CATEGORY_LABELS } from "@/lib/subscriptions/categories";
import type { CategoryShare } from "@/lib/subscriptions/schedule";

export function CategoryBreakdown({ shares }: { shares: CategoryShare[] }) {
  return (
    <ul className="flex flex-col gap-4 px-5 pb-5">
      {shares.map((share) => {
        const percent = Math.round(share.share * 100);
        return (
          <li key={share.category}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-fg">
                {CATEGORY_LABELS[share.category]} <span className="text-xs text-subtle">({share.count})</span>
              </span>
              <span className="shrink-0 tabular-nums text-muted">
                {formatPLN(share.monthlyCents)} <span className="text-xs text-subtle">/ mies.</span>
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-surface-3"
              role="meter"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${CATEGORY_LABELS[share.category]}: ${percent}% wydatków`}
            >
              <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.max(percent, 2)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
