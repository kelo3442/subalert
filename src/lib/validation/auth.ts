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

export const registerSchema = z
  .object({
    email,
    password: z
      .string("Podaj hasło.")
      .min(8, "Hasło musi mieć co najmniej 8 znaków.")
      .max(72, "Hasło może mieć maksymalnie 72 znaki."),
    passwordConfirm: z.string("Powtórz hasło."),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Hasła nie są takie same.",
  });

export type LoginField = keyof z.input<typeof loginSchema>;
export type RegisterField = keyof z.input<typeof registerSchema>;

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
