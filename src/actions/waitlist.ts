"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/data/user";
import { addToWaitlist, isAdminEmail, sendLaunchNotifications, unsubscribeFromWaitlist } from "@/lib/waitlist";
import type { FormState } from "./form-state";

export type WaitlistField = "email";

const emailSchema = z.email("Podaj poprawny adres e-mail.").max(320);

/** "Powiadom mnie" on the landing page; works without an account. */
export async function joinWaitlistFromLanding(_prev: FormState<WaitlistField>, formData: FormData): Promise<FormState<WaitlistField>> {
  const success: FormState<WaitlistField> = {
    status: "success",
    message: "Gotowe! Jesteś na liście — sprawdź skrzynkę, wysłaliśmy potwierdzenie. Damy znać, gdy Premium wystartuje.",
  };
  // Bots fill every field; people never see this one.
  if (String(formData.get("company") ?? "").length > 0) return success;

  const email = String(formData.get("email") ?? "").trim();
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { status: "error", fieldErrors: { email: [parsed.error.issues[0]?.message ?? "Podaj poprawny adres e-mail."] }, values: { email } };
  }
  const result = await addToWaitlist({ email: parsed.data, source: "landing" });
  if (result === "unavailable") return { status: "error", message: "Nie udało się zapisać. Spróbuj ponownie za chwilę.", values: { email } };
  if (result === "exists") return { status: "success", message: "Ten adres jest już na liście — damy znać, gdy Premium wystartuje." };
  return success;
}

export async function unsubscribeWaitlist(token: string): Promise<void> {
  const ok = await unsubscribeFromWaitlist(token);
  redirect(`/premium/wypisz?t=${encodeURIComponent(token)}&${ok ? "wypisano=1" : "blad=1"}`);
}

/** Admin only: e-mails everyone on the waitlist that Premium is live. */
export async function notifyWaitlistLaunch(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) return { status: "error", message: "Brak uprawnień." };
  if (String(formData.get("confirmation") ?? "").trim().toUpperCase() !== "WYŚLIJ") {
    return { status: "error", message: "Wpisz WYŚLIJ, aby potwierdzić wysyłkę." };
  }
  const result = await sendLaunchNotifications();
  if (!result) return { status: "error", message: "Wysyłka e-maili nie jest skonfigurowana (Resend)." };
  revalidatePath("/panel/admin");
  return {
    status: result.failed > 0 ? "error" : "success",
    message:
      `Wysłano: ${result.sent}${result.failed ? `, nie udało się: ${result.failed}` : ""}.` +
      (result.remaining > 0 ? ` Zostało jeszcze ${result.remaining} — kliknij ponownie, aby wysłać kolejną partię.` : " Wszyscy z listy zostali powiadomieni."),
  };
}
