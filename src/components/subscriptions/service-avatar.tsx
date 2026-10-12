import { cn } from "@/components/ui/cn";

const PALETTE = ["#c4f542", "#7dd3fc", "#f9a8d4", "#fcd34d", "#a5b4fc", "#86efac", "#fdba74", "#c4b5fd"];

function colorFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

/** Neutral monogram instead of third-party logos. */
export function ServiceAvatar({ name, className }: { name: string; className?: string }) {
  const color = colorFor(name);
  const initials = name.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className={cn("grid size-10 shrink-0 place-items-center rounded-xl border text-sm font-semibold", className)}
      style={{ color, borderColor: `${color}33`, backgroundColor: `${color}14` }}
    >
      {initials}
    </span>
  );
}
