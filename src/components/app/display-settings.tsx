"use client";

import { Sun, Type } from "lucide-react";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { DISPLAY_STORAGE_KEY } from "@/lib/display";

type Display = { largeText: boolean; light: boolean };
export const DISPLAY_BOOT_SCRIPT = `try{var d=JSON.parse(localStorage.getItem("${DISPLAY_STORAGE_KEY}")||"{}");var c=document.documentElement.classList;c.toggle("text-large",!!d.largeText);c.toggle("theme-light",!!d.light)}catch(e){}`;

const OFF: Display = { largeText: false, light: false };
const listeners = new Set<() => void>();
let cached: { raw: string | null; value: Display } | null = null;

function read(): Display {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(DISPLAY_STORAGE_KEY);
  } catch {}
  if (cached && cached.raw === raw) return cached.value;
  let value = OFF;
  try {
    const parsed = JSON.parse(raw ?? "{}");
    value = { largeText: Boolean(parsed.largeText), light: Boolean(parsed.light) };
  } catch {}
  cached = { raw, value };
  return value;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function Switch({ id, checked, onChange, label, hint, icon }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; hint: string; icon: ReactNode }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 py-4">
      <span className="flex items-start gap-3">
        <span className="mt-0.5 text-accent">{icon}</span>
        <span>
          <span className="block text-base font-medium text-fg">{label}</span>
          <span className="block text-sm text-muted">{hint}</span>
        </span>
      </span>
      <span className="relative shrink-0">
        <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span
          className={cn(
            "block h-8 w-14 rounded-full border border-line bg-surface-3 transition-colors peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-accent",
          )}
        />
        <span className="pointer-events-none absolute left-1 top-1 size-6 rounded-full bg-fg/70 transition-transform peer-checked:translate-x-6 peer-checked:bg-accent-ink" />
      </span>
    </label>
  );
}

/** Larger text and a light theme, remembered on this device. */
export function DisplaySettings() {
  const display = useSyncExternalStore(subscribe, read, () => OFF);
  const update = (patch: Partial<Display>) => {
    const next = { ...display, ...patch };
    try {
      localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(next));
    } catch {}
    cached = { raw: JSON.stringify(next), value: next };
    listeners.forEach((listener) => listener());
    document.documentElement.classList.toggle("text-large", next.largeText);
    document.documentElement.classList.toggle("theme-light", next.light);
  };
  return (
    <Card id="wyglad" className="scroll-mt-24">
      <CardHeader icon={<Type className="size-5" aria-hidden />} title="Wygląd" description="Ustawienia zapamiętamy na tym urządzeniu." />
      <div className="divide-y divide-line px-5 pb-1">
        <Switch
          id="large-text"
          checked={display.largeText}
          onChange={(v) => update({ largeText: v })}
          label="Większy tekst"
          hint="Powiększa litery i przyciski w całej aplikacji."
          icon={<Type className="size-5" aria-hidden />}
        />
        <Switch
          id="light-theme"
          checked={display.light}
          onChange={(v) => update({ light: v })}
          label="Jasny wygląd"
          hint="Ciemny tekst na jasnym tle — łatwiejszy do czytania w dzień."
          icon={<Sun className="size-5" aria-hidden />}
        />
      </div>
    </Card>
  );
}
