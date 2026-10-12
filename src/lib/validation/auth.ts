import { z } from "zod";
import { readString } from "./shared";

const email = z
  .string("Podaj adres e-mail.")
  .trim()
  .min(1, "Podaj adres e-mail.")
  .max(254, "Adres e-mail jest za długi.")
  .pipe(z.email("Podaj poprawny adres e-mail."));

export const loginSchema = z.object({
  email,
  password: z.string("Podaj hasło.").min(1, "Podaj hasło.").max(72, "Hasło jest za długie."),
});

const newPassword = z
  .string("Podaj hasło.")
  .min(8, "Hasło musi mieć co najmniej 8 znaków.")
  .max(72, "Hasło może mieć maksymalnie 72 znaki.");

const passwordsMatch = (value: { password: string; passwordConfirm: string }) =>
  value.password === value.passwordConfirm;
const mismatch = { path: ["passwordConfirm"], message: "Hasła nie są takie same." };

export const registerSchema = z
  .object({ email, password: newPassword, passwordConfirm: z.string("Powtórz hasło.") })
  .refine(passwordsMatch, mismatch);

export const forgotPasswordSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password: newPassword, passwordConfirm: z.string("Powtórz hasło.") })
  .refine(passwordsMatch, mismatch);

/** The user must type this word to confirm account deletion. */
export const DELETE_ACCOUNT_CONFIRMATION = "USUŃ";

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .trim()
    .refine((value) => value.toUpperCase() === DELETE_ACCOUNT_CONFIRMATION, `Wpisz ${DELETE_ACCOUNT_CONFIRMATION}, aby potwierdzić.`),
});

export type LoginField = keyof z.input<typeof loginSchema>;
export type RegisterField = keyof z.input<typeof registerSchema>;
export type ForgotPasswordField = keyof z.input<typeof forgotPasswordSchema>;
export type NewPasswordField = keyof z.input<typeof newPasswordSchema>;
export type DeleteAccountField = keyof z.input<typeof deleteAccountSchema>;

export function loginInputFromFormData(formData: FormData) {
  return { email: readString(formData, "email"), password: readString(formData, "password") };
}

export function registerInputFromFormData(formData: FormData) {
  return {
    email: readString(formData, "email"),
    password: readString(formData, "password"),
    passwordConfirm: readString(formData, "passwordConfirm"),
  };
}

export function newPasswordInputFromFormData(formData: FormData) {
  return {
    password: readString(formData, "password"),
    passwordConfirm: readString(formData, "passwordConfirm"),
  };
}
