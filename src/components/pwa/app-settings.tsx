"use client";

import { BellRing, CircleCheck, Download, LoaderCircle, Share, Smartphone, SquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { removePushSubscription, savePushSubscription, sendTestPush } from "@/actions/push";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useInstallState } from "./install-state";

type PushStatus = "loading" | "unsupported" | "needs-install" | "denied" | "off" | "on";

function base64UrlToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padded = (value + "=".repeat((4 - (value.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function pushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

function InstallSection() {
  const state = useInstallState();
  const [busy, setBusy] = useState(false);

  if (state.kind === "unknown") return null;
  if (state.kind === "installed") {
    return (
      <p className="flex items-start gap-2 text-sm text-muted">
        <CircleCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        Korzystasz z aplikacji Opłacik zainstalowanej na tym urządzeniu.
      </p>
    );
  }
  if (state.kind === "prompt") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Ikona Opłacika na ekranie głównym, pełny ekran i szybkie uruchamianie — bez sklepu z aplikacjami.</p>
        <Button
          className="shrink-0"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await state.install().finally(() => setBusy(false));
          }}
        >
          <Download className="size-4" aria-hidden /> Zainstaluj aplikację
        </Button>
      </div>
    );
  }
  if (state.kind === "ios") {
    return (
      <div className="text-sm text-muted">
        <p>Na iPhonie zainstalujesz Opłacik w Safari w trzech krokach:</p>
        <ol className="mt-3 flex flex-col gap-2.5">
          {[
            <>
              Stuknij <Share className="inline size-4 align-[-3px] text-fg" aria-hidden /> <strong className="text-fg">Udostępnij</strong> na dole ekranu.
            </>,
            <>
              Wybierz <SquarePlus className="inline size-4 align-[-3px] text-fg" aria-hidden /> <strong className="text-fg">Do ekranu początkowego</strong>.
            </>,
            <>
              Stuknij <strong className="text-fg">Dodaj</strong> i otwórz Opłacik z ekranu głównego.
            </>,
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-3 text-xs text-fg">{index + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  return (
    <p className="text-sm text-muted">
      Otwórz menu przeglądarki (⋮ lub ⋯) i wybierz <strong className="text-fg">Zainstaluj aplikację</strong> albo{" "}
      <strong className="text-fg">Dodaj do ekranu głównego</strong>.
    </p>
  );
}

function PushSection({ publicKey }: { publicKey: string }) {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // iOS allows push only for apps added to the home screen.
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
      if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone) {
        if (!cancelled) setStatus("needs-install");
        return;
      }
      if (!pushSupported()) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      // Re-sync in case the server lost this device (e.g. after signing in to another account).
      if (subscription) await savePushSubscription(subscription.toJSON());
      if (!cancelled) setStatus(subscription ? "on" : "off");
    })().catch(() => !cancelled && setStatus("unsupported"));
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToUint8Array(publicKey) }));
      const { ok } = await savePushSubscription(subscription.toJSON());
      if (!ok) {
        setMessage("Nie udało się zapisać urządzenia. Spróbuj ponownie.");
        return;
      }
      setStatus("on");
    } catch {
      setMessage("Ta przeglądarka nie pozwoliła włączyć powiadomień.");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await removePushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true);
    const { delivered } = await sendTestPush().finally(() => setBusy(false));
    setMessage(delivered > 0 ? "Wysłano. Powiadomienie powinno pojawić się za chwilę." : "Nie udało się wysłać — wyłącz i włącz powiadomienia ponownie.");
  };

  return (
    <div className="flex flex-col gap-3" data-testid="push-settings">
      <p className="flex items-center gap-2 font-medium text-fg">
        <BellRing className="size-4 text-accent" aria-hidden /> Powiadomienia na tym urządzeniu
      </p>
      {status === "loading" && <LoaderCircle className="size-4 animate-spin text-subtle" aria-hidden />}
      {status === "unsupported" && <p className="text-sm text-muted">Ta przeglądarka nie obsługuje powiadomień. Spróbuj w Chrome, Edge, Firefoksie albo Safari.</p>}
      {status === "needs-install" && (
        <p className="text-sm text-muted">Na iPhonie powiadomienia działają po zainstalowaniu Opłacika na ekranie początkowym (iOS 16.4 lub nowszy). Zainstaluj aplikację i otwórz te ustawienia z niej.</p>
      )}
      {status === "denied" && (
        <p className="text-sm text-muted">Powiadomienia są zablokowane dla Opłacika. Zezwól na nie w ustawieniach przeglądarki lub telefonu i odśwież stronę.</p>
      )}
      {(status === "off" || status === "on") && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            {status === "on"
              ? "Włączone — przypomnienia o płatnościach i końcu okresu próbnego przyjdą też jako powiadomienie."
              : "Dostawaj przypomnienia jako powiadomienie na telefonie, oprócz e-maila."}
          </p>
          <div className="flex shrink-0 gap-2">
            {status === "on" ? (
              <>
                <Button variant="secondary" size="sm" disabled={busy} onClick={test}>
                  Wyślij test
                </Button>
                <Button variant="ghost" size="sm" disabled={busy} onClick={disable}>
                  Wyłącz
                </Button>
              </>
            ) : (
              <Button size="sm" disabled={busy} onClick={enable}>
                {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden />} Włącz powiadomienia
              </Button>
            )}
          </div>
        </div>
      )}
      {message && (
        <p className="text-sm text-muted" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

/** Settings card: install the PWA and turn on push notifications for this device. */
export function AppSettings({ pushPublicKey }: { pushPublicKey: string | null }) {
  return (
    <Card id="aplikacja" className="scroll-mt-24">
      <CardHeader icon={<Smartphone className="size-5" aria-hidden />} title="Aplikacja na telefon" description="Zainstaluj Opłacik jak zwykłą aplikację i włącz powiadomienia." />
      <div className="flex flex-col gap-5 p-5">
        <InstallSection />
        {pushPublicKey && (
          <div className="border-t border-line pt-5">
            <PushSection publicKey={pushPublicKey} />
          </div>
        )}
      </div>
    </Card>
  );
}
