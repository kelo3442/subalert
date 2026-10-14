"use client";

import { BellRing, LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { joinWaitlistFromLanding, type WaitlistField } from "@/actions/waitlist";
import type { FormState } from "@/actions/form-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { describedBy, Input } from "@/components/ui/field";

const initialState: FormState<WaitlistField> = { status: "idle" };

/** Landing-page sign-up for the Premium launch e-mail; no account needed. */
export function WaitlistForm() {
  const [state, action, isPending] = useActionState(joinWaitlistFromLanding, initialState);
  const errors = state.fieldErrors?.email;

  return (
    <div className="mt-6 rounded-3xl border border-accent/30 bg-accent/[0.06] p-5 sm:p-6" data-testid="landing-waitlist">
      <p className="flex items-center gap-2 font-semibold text-fg">
        <BellRing className="size-4 text-accent" aria-hidden /> Daj mi znać, gdy Premium wystartuje
      </p>
      <p className="mt-1 text-sm text-muted">Jedna wiadomość w dniu startu. Bez spamu — wypiszesz się jednym kliknięciem.</p>
      {state.status === "success" ? (
        <Alert tone="success" className="mt-4">
          {state.message}
        </Alert>
      ) : (
        <form action={action} noValidate className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="flex-1">
            <label htmlFor="waitlist-email" className="sr-only">
              Adres e-mail
            </label>
            <Input
              id="waitlist-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="twój@email.pl"
              defaultValue={state.values?.email}
              invalid={Boolean(errors)}
              aria-describedby={describedBy("waitlist-email", errors)}
              required
            />
            {errors && (
              <p id="waitlist-email-error" className="mt-1.5 text-sm text-danger">
                {errors[0]}
              </p>
            )}
          </div>
          {/* Honeypot: hidden from people, filled in by bots. */}
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          <Button type="submit" disabled={isPending} aria-busy={isPending} className="shrink-0">
            {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />} Powiadom mnie
          </Button>
        </form>
      )}
      {state.status === "error" && state.message && (
        <Alert tone="error" className="mt-3">
          {state.message}
        </Alert>
      )}
    </div>
  );
}
