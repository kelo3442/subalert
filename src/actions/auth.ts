"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authErrorMessage } from "@/lib/auth-errors";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/env";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  loginInputFromFormData,
  loginSchema,
  registerInputFromFormData,
  registerSchema,
  type LoginField,
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
    options: { emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/panel` },
  });
  if (error) {
    return { status: "error", message: authErrorMessage(error), values: { email: input.email } };
  }

  // With e-mail confirmation disabled Supabase signs the user in right away.
  if (data.session) redirect("/panel");

  return {
    status: "success",
    message: `Wysłaliśmy link aktywacyjny na adres ${parsed.data.email}. Kliknij go, aby dokończyć rejestrację.`,
  };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
