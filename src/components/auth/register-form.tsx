"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/actions/auth";
import type { FormState } from "@/actions/form-state";
import { Alert } from "@/components/ui/alert";
import { describedBy, Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { RegisterField } from "@/lib/validation/auth";

const initialState: FormState<RegisterField> = { status: "idle" };

export function RegisterForm() {
  const [state, action] = useActionState(signUp, initialState);
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
      <Field id="password" label="Hasło" hint="Co najmniej 8 znaków." errors={errors.password}>
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
      <Field id="passwordConfirm" label="Powtórz hasło" errors={errors.passwordConfirm}>
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
      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            name="acceptTerms"
            className="mt-0.5 size-4 shrink-0 accent-[#c4f542]"
            aria-invalid={Boolean(errors.acceptTerms) || undefined}
            aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined}
          />
          <span>
            Akceptuję{" "}
            <Link href="/regulamin" target="_blank" className="text-accent hover:underline">
              regulamin
            </Link>{" "}
            i{" "}
            <Link href="/prywatnosc" target="_blank" className="text-accent hover:underline">
              politykę prywatności
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms && (
          <p id="acceptTerms-error" className="mt-1.5 text-xs text-danger" role="alert">
            {errors.acceptTerms[0]}
          </p>
        )}
      </div>
      <SubmitButton size="lg" className="mt-2 w-full" pendingText="Tworzenie konta…">
        Załóż konto
      </SubmitButton>
      <p className="text-center text-xs text-subtle">
        Hasło przechowuje Supabase Auth w postaci zaszyfrowanej. SubAlert nie widzi Twojego hasła.
      </p>
    </form>
  );
}
