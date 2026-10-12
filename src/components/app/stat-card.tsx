import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export function StatCard({
  label,
  value,
  detail,
  icon,
  highlight = false,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-2xl border p-4 sm:p-5",
        highlight ? "border-accent/30 bg-gradient-to-br from-accent/[0.12] to-surface" : "border-line bg-surface",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn("text-xs font-medium sm:text-sm", highlight ? "text-accent/90" : "text-muted")}>{label}</p>
        <span className={highlight ? "text-accent" : "text-subtle"}>{icon}</span>
      </div>
      <p className={cn("mt-2 truncate text-xl font-semibold tabular-nums tracking-tight sm:text-2xl", highlight ? "text-accent" : "text-fg")}>
        {value}
      </p>
      {detail && <p className="mt-1 truncate text-xs text-subtle">{detail}</p>}
    </div>
  );
}
