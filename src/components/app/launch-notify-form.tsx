"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useActionState } from "react";
import type { FormState } from "@/actions/form-state";
import { notifyWaitlistLaunch } from "@/actions/waitlist";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

const initialState: FormState = { status: "idle" };

export function LaunchNotifyForm({ pending, salesOpen }: { pending: number; salesOpen: boolean }) {
  const [state, action, isPending] = useActionState(notifyWaitlistLaunch, initialState);
  return (
    <form action={action} className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Wyśle e-mail „Opłacik Premium już działa” do {pending} {pending === 1 ? "osoby" : "osób"}, które jeszcze go nie dostały (każda tylko raz).
        {!salesOpen && " Uwaga: sprzedaż Premium jest wyłączona — najpierw ustaw NEXT_PUBLIC_PREMIUM_SALES_ENABLED=true."}
      </p>
      {state.message && <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input name="confirmation" placeholder="Wpisz WYŚLIJ" autoComplete="off" className="sm:max-w-48" aria-label="Potwierdzenie" />
        <Button type="submit" disabled={isPending || pending === 0} aria-busy={isPending}>
          {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          Powiadom wszystkich
        </Button>
      </div>
    </form>
  );
}
