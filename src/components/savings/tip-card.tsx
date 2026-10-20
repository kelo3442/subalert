import type { ReactNode } from "react";
import { dismissTip } from "@/actions/savings";
import { SubmitButton } from "@/components/ui/submit-button";

/** One thing to check on the savings tab, with "Zostawiam" to hide it for good. */
export function TipCard({
  tipKey,
  icon,
  title,
  children,
  actions,
  canDismiss,
}: {
  tipKey: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  canDismiss: boolean;
}) {
  return (
    <li className="rounded-2xl border border-warn/30 bg-warn/[0.05] p-4 sm:p-5" data-testid="savings-tip">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-warn">{icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-fg">{title}</h3>
          <div className="mt-1 text-sm leading-relaxed text-muted">{children}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {actions}
            {canDismiss && (
              <form action={dismissTip.bind(null, tipKey)}>
                <SubmitButton variant="ghost" size="sm">
                  Zostawiam
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
