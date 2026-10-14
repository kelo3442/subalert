"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireUser } from "@/lib/data/user";
import { getEmailConfig, sendEmail } from "@/lib/email/resend";
import { getLegalInfo } from "@/lib/legal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FormState } from "./form-state";

const feedbackSchema = z.object({
  message: z.string().trim().min(3, "Napisz kilka słów.").max(2000, "Maksymalnie 2000 znaków."),
  page: z.string().max(200).optional(),
});

export type FeedbackField = "message";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Stores the feedback and forwards it to the contact address, with the user as reply-to. */
export async function sendFeedback(_prev: FormState<FeedbackField>, formData: FormData): Promise<FormState<FeedbackField>> {
  const user = await requireUser();
  const parsed = feedbackSchema.safeParse({
    message: formData.get("message"),
    page: typeof formData.get("page") === "string" ? String(formData.get("page")).slice(0, 200) : undefined,
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("feedback").insert({ user_id: user.id, message: parsed.data.message, page: parsed.data.page ?? null });
  if (error) {
    return {
      status: "error",
      message: error.message.includes("feedback_limit")
        ? "Dziś wysłałeś już sporo wiadomości — dzięki! Spróbuj ponownie jutro."
        : "Nie udało się wysłać. Spróbuj ponownie za chwilę.",
    };
  }

  const emailConfig = getEmailConfig();
  const to = getLegalInfo().contactEmail;
  if (emailConfig && to) {
    const { message, page } = parsed.data;
    await sendEmail(emailConfig, {
      to,
      replyTo: user.email || undefined,
      subject: `Opinia o Opłaciku od ${user.email}`,
      text: `${message}\n\n—\nOd: ${user.email}\nStrona: ${page ?? "-"}`,
      html: `<p style="white-space:pre-wrap">${escapeHtml(message)}</p><hr><p style="color:#71717a;font-size:12px">Od: ${escapeHtml(user.email)}<br>Strona: ${escapeHtml(page ?? "-")}</p>`,
      idempotencyKey: `feedback-${randomUUID()}`,
    });
  }
  return { status: "success", message: "Dziękujemy! Wiadomość dotarła — odpowiemy na Twój e-mail, jeśli będzie trzeba." };
}
