import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

const CONTROL =
  "w-full rounded-xl border bg-surface-2 px-3.5 text-[15px] text-fg placeholder:text-subtle transition-colors " +
  "focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60";

function controlClasses(invalid: boolean, className?: string) {
  return cn(CONTROL, invalid ? "border-danger/60" : "border-line hover:border-line-strong", className);
}

interface FieldProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  errors?: string[];
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ id, label, hint, errors, optional, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-fg">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-subtle">opcjonalne</span>}
      </label>
      {children}
      {hint && !errors?.length && (
        <p id={`${id}-hint`} className="text-xs text-subtle">
          {hint}
        </p>
      )}
      {errors?.length ? (
        <p id={`${id}-error`} className="text-xs text-danger" role="alert">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, errors?: string[], hint?: boolean) {
  if (errors?.length) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

type ControlProps = { invalid?: boolean };

export function Input({ invalid = false, className, ...props }: ComponentProps<"input"> & ControlProps) {
  return <input aria-invalid={invalid || undefined} className={controlClasses(invalid, cn("h-11", className))} {...props} />;
}

export function Select({ invalid = false, className, ...props }: ComponentProps<"select"> & ControlProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={controlClasses(invalid, cn("h-11 appearance-none pr-10", className))}
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  );
}

export function Textarea({ invalid = false, className, ...props }: ComponentProps<"textarea"> & ControlProps) {
  return <textarea aria-invalid={invalid || undefined} className={controlClasses(invalid, cn("min-h-24 py-2.5", className))} {...props} />;
}
