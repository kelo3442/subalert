"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { PASSWORD_PAGE } from "@/lib/auth-confirm";
import { authErrorMessage } from "@/lib/auth-errors";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/env";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/user";
import {
  deleteAccountSchema,
  forgotPasswordSchema,
  loginInputFromFormData,
  loginSchema,
  newPasswordInputFromFormData,
  newPasswordSchema,
  registerInputFromFormData,
  registerSchema,
  type DeleteAccountField,
  type ForgotPasswordField,
  type LoginField,
  type NewPasswordField,
  type RegisterField,
} from "@/lib/validation/auth";
import { readString } from "@/lib/validation/shared";
import type { FormState } from "./form-state";

const NOT_CONFIGURED = "Logowanie nie jest skonfigurowane na tym serwerze.";

export async function signIn(_prev: FormState<LoginField>, formData: FormData): Promise<FormState<LoginField>> {
  if (!isSupabaseConfigured()) return { status: "error", message: NOT_CONFIGURED };

  const input = loginInputFromFormData(formData);
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: { email: input.email },
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { status: "error", message: authErrorMessage(error), values: { email: input.email } };
  }

  redirect(safeRedirectPath(readString(formData, "next")));
}

export async function signUp(
  _prev: FormState<RegisterField>,
  formData: FormData,
): Promise<FormState<RegisterField>> {
  if (!isSupabaseConfigured()) return { status: "error", message: NOT_CONFIGURED };

  const input = registerInputFromFormData(formData);
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: { email: input.email },
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/panel/start` },
  });
  if (error) {
    return { status: "error", message: authErrorMessage(error), values: { email: input.email } };
  }

  // With e-mail confirmation disabled Supabase signs the user in right away.
  if (data.session) redirect("/panel/start");

  return {
    status: "success",
    message: `Wysłaliśmy link aktywacyjny na adres ${parsed.data.email}. Kliknij go, aby dokończyć rejestrację.`,
  };
}


export async function requestPasswordReset(
  _prev: FormState<ForgotPasswordField>,
  formData: FormData,
): Promise<FormState<ForgotPasswordField>> {
  if (!isSupabaseConfigured()) return { status: "error", message: NOT_CONFIGURED };

  const email = readString(formData, "email");
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors, values: { email } };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=${encodeURIComponent(PASSWORD_PAGE)}`,
  });
  // Rate limits are worth reporting; anything else gets the same answer so the
  // form does not reveal which addresses have an account.
  if (error && (error.status === 429 || error.code?.startsWith("over_"))) {
    return { status: "error", message: authErrorMessage(error), values: { email } };
  }

  return {
    status: "success",
    message: `Jeśli konto ${parsed.data.email} istnieje, wysłaliśmy na nie link do ustawienia nowego hasła. Link jest ważny przez ograniczony czas.`,
  };
}

export async function updatePassword(
  _prev: FormState<NewPasswordField>,
  formData: FormData,
): Promise<FormState<NewPasswordField>> {
  await requireUser();
  const parsed = newPasswordSchema.safeParse(newPasswordInputFromFormData(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { status: "error", message: authErrorMessage(error) };
  }

  redirect("/panel/ustawienia?haslo=zmienione");
}

export async function deleteAccount(
  _prev: FormState<DeleteAccountField>,
  formData: FormData,
): Promise<FormState<DeleteAccountField>> {
  await requireUser();
  const parsed = deleteAccountSchema.safeParse({ confirmation: readString(formData, "confirmation") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("delete_own_account");
  if (error) return { status: "error", message: "Nie udało się usunąć konta. Spróbuj ponownie." };

  // The user no longer exists; clear the session cookies locally.
  await supabase.auth.signOut({ scope: "local" });
  redirect("/logowanie?info=konto-usuniete");
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
