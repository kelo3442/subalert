import type { ReactNode } from "react";
import { cn } from "./cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-line bg-surface-2 text-accent">{icon}</div>
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
