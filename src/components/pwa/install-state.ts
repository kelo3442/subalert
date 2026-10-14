"use client";

import { useEffect, useState } from "react";

/** Chrome/Edge/Android event that lets a page show its own "Install" button. */
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __oplacikInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

const CHANGE_EVENT = "oplacik:install-change";

/** Captures the install prompt as early as possible (it fires once, often before React mounts). */
export function listenForInstallPrompt(): () => void {
  const onPrompt = (event: Event) => {
    event.preventDefault();
    window.__oplacikInstallPrompt = event as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };
  const onInstalled = () => {
    window.__oplacikInstallPrompt = null;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };
  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

export type InstallState =
  | { kind: "unknown" }
  | { kind: "installed" }
  | { kind: "prompt"; install: () => Promise<boolean> }
  | { kind: "ios" }
  | { kind: "manual" };

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function currentState(): InstallState {
  if (isStandalone()) return { kind: "installed" };
  const prompt = window.__oplacikInstallPrompt;
  if (prompt) {
    return {
      kind: "prompt",
      install: async () => {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        window.__oplacikInstallPrompt = null;
        window.dispatchEvent(new Event(CHANGE_EVENT));
        return outcome === "accepted";
      },
    };
  }
  return isIos() ? { kind: "ios" } : { kind: "manual" };
}

export function useInstallState(): InstallState {
  const [state, setState] = useState<InstallState>({ kind: "unknown" });
  useEffect(() => {
    const update = () => setState(currentState());
    update();
    window.addEventListener(CHANGE_EVENT, update);
    return () => window.removeEventListener(CHANGE_EVENT, update);
  }, []);
  return state;
}
