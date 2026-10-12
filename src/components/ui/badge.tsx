import type { ReactNode } from "react";
import { cn } from "./cn";

type Tone = "neutral" | "accent" | "warn" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-3 text-muted border-line",
  accent: "bg-accent/10 text-accent border-accent/25",
  warn: "bg-warn/10 text-warn border-warn/25",
  danger: "bg-danger/10 text-danger border-danger/25",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
