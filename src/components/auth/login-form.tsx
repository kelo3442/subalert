"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/actions/auth";
import type { FormState } from "@/actions/form-state";
import { Alert } from "@/components/ui/alert";
import { describedBy, Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { LoginField } from "@/lib/validation/auth";

const initialState: FormState<LoginField> = { status: "idle" };

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action] = useActionState(signIn, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      {notice && state.status === "idle" && <Alert tone="info">{notice}</Alert>}
      {state.message && <Alert tone="error">{state.message}</Alert>}
      <input type="hidden" name="next" value={next ?? ""} />
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
      <Field id="password" label="Hasło" errors={errors.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          invalid={Boolean(errors.password)}
          aria-describedby={describedBy("password", errors.password)}
        />
      </Field>
      <Link href="/zapomnialem-hasla" className="-mt-1 self-end text-sm text-accent hover:underline">
        Nie pamiętasz hasła?
      </Link>
      <SubmitButton size="lg" className="w-full" pendingText="Logowanie…">
        Zaloguj się
      </SubmitButton>
    </form>
  );
}
