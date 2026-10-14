"use client";

import { useEffect } from "react";
import { listenForInstallPrompt } from "./install-state";

/** Registers /sw.js (push notifications, offline page) and captures the install prompt. */
export function RegisterServiceWorker() {
  useEffect(() => {
    const stop = listenForInstallPrompt();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
    }
    return stop;
  }, []);
  return null;
}
