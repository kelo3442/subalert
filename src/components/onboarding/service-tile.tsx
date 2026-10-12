import { Check } from "lucide-react";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { cn } from "@/components/ui/cn";

export function ServiceTile({
  name,
  selected,
  alreadyAdded,
  onToggle,
}: {
  name: string;
  selected: boolean;
  alreadyAdded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={alreadyAdded}
      aria-pressed={selected}
      className={cn(
        "relative flex min-h-16 items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-45",
        selected
          ? "border-accent/60 bg-accent/10 shadow-[0_0_0_1px_rgba(196,245,66,0.25)]"
          : "border-line bg-surface hover:border-line-strong hover:bg-surface-2 active:scale-[0.98]",
      )}
    >
      <ServiceAvatar name={name} className="size-9" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-tight text-fg">{name}</span>
        {alreadyAdded && <span className="text-xs text-subtle">już dodana</span>}
      </span>
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
          selected ? "border-accent bg-accent text-accent-ink" : "border-line-strong",
        )}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}
