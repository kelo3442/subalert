"use client";

import { useActionState } from "react";
import { updatePassword } from "@/actions/auth";
import type { FormState } from "@/actions/form-state";
import { Alert } from "@/components/ui/alert";
import { describedBy, Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { NewPasswordField } from "@/lib/validation/auth";

const initialState: FormState<NewPasswordField> = { status: "idle" };

export function NewPasswordForm() {
  const [state, action] = useActionState(updatePassword, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <Field id="password" label="Nowe hasło" hint="Co najmniej 8 znaków." errors={errors.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          invalid={Boolean(errors.password)}
          aria-describedby={describedBy("password", errors.password, true)}
        />
      </Field>
      <Field id="passwordConfirm" label="Powtórz nowe hasło" errors={errors.passwordConfirm}>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          invalid={Boolean(errors.passwordConfirm)}
          aria-describedby={describedBy("passwordConfirm", errors.passwordConfirm)}
        />
      </Field>
      <SubmitButton className="mt-2 self-start" pendingText="Zapisywanie…">
        Zapisz nowe hasło
      </SubmitButton>
    </form>
  );
}
