"use client";

import { Download, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useInstallState } from "./install-state";

const DISMISSED_KEY = "oplacik:install-banner-dismissed";

/** Phone-only nudge on the dashboard to add Opłacik to the home screen. */
export function InstallBanner() {
  const state = useInstallState();
  // Nothing renders before the install state is known on the client, so reading storage here cannot cause a hydration mismatch.
  const [dismissed, setDismissed] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (dismissed || (state.kind !== "prompt" && state.kind !== "ios")) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  };

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/[0.07] p-3 lg:hidden" data-testid="install-banner">
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static icon */}
      <img src="/icons/icon-192.png" alt="" className="size-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg">Zainstaluj Opłacik</p>
        <p className="text-xs text-muted">Ikona na ekranie głównym i powiadomienia o płatnościach.</p>
      </div>
      {state.kind === "prompt" ? (
        <Button size="sm" onClick={() => state.install()} className="shrink-0">
          <Download className="size-4" aria-hidden /> Zainstaluj
        </Button>
      ) : (
        <Link href="/panel/ustawienia#aplikacja" className="shrink-0 text-sm font-medium text-accent">
          Jak?
        </Link>
      )}
      <button type="button" onClick={dismiss} className="grid size-8 shrink-0 place-items-center rounded-lg text-subtle hover:text-fg" aria-label="Zamknij">
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
