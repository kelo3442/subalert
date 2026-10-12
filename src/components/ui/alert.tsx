import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./cn";

type Tone = "info" | "success" | "error" | "warn";

const STYLES: Record<Tone, { box: string; Icon: typeof Info }> = {
  info: { box: "border-line bg-surface-2 text-muted", Icon: Info },
  success: { box: "border-accent/30 bg-accent/10 text-accent", Icon: CircleCheck },
  error: { box: "border-danger/30 bg-danger/10 text-danger", Icon: CircleAlert },
  warn: { box: "border-warn/30 bg-warn/10 text-warn", Icon: CircleAlert },
};

export function Alert({ tone = "info", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const { box, Icon } = STYLES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-relaxed", box, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
