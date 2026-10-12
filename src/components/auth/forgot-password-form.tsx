"use client";

import { MailCheck } from "lucide-react";
import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import type { FormState } from "@/actions/form-state";
import { Alert } from "@/components/ui/alert";
import { describedBy, Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ForgotPasswordField } from "@/lib/validation/auth";

const initialState: FormState<ForgotPasswordField> = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialState);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <div className="grid size-12 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
          <MailCheck className="size-6" aria-hidden />
        </div>
        <h2 className="mt-4 font-semibold text-fg">Sprawdź skrzynkę</h2>
        <p className="mt-1.5 text-sm text-muted" role="status">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <Field id="email" label="E-mail" errors={errors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          key={state.values?.email}
          invalid={Boolean(errors.email)}
          aria-describedby={describedBy("email", errors.email)}
        />
      </Field>
      <SubmitButton size="lg" className="mt-2 w-full" pendingText="Wysyłanie…">
        Wyślij link
      </SubmitButton>
    </form>
  );
}
