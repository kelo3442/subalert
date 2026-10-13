import { Crown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import type { PlanStatus } from "@/lib/data/plan";
import { isPremiumSalesOpen } from "@/lib/env";

/** Current plan with a link to /panel/premium — compact in the sidebar, a card in settings. */
export function PlanBadge({ plan, variant = "compact" }: { plan: PlanStatus; variant?: "compact" | "card" }) {
  const label = plan.premium ? "Premium" : `Plan darmowy · ${plan.activeCount}/${plan.limit}`;
  const hint = plan.premium
    ? "Bez limitu pozycji"
    : isPremiumSalesOpen()
      ? "Przejdź na Premium — bez limitu"
      : "Premium bez limitu — wkrótce";
  return (
    <Link
      href="/panel/premium"
      className={cn(
        "group flex items-center gap-3 rounded-xl border transition-colors",
        plan.premium ? "border-accent/40 bg-accent/[0.08]" : "border-line bg-surface-2 hover:border-accent/50",
        variant === "card" ? "p-4" : "p-3",
      )}
    >
      <Crown className={cn("size-5 shrink-0", plan.premium ? "text-accent" : "text-muted group-hover:text-accent")} aria-hidden />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-fg">{label}</span>
        <span className="block truncate text-xs text-muted">{hint}</span>
      </span>
    </Link>
  );
}
