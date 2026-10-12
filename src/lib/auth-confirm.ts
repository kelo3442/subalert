export const PASSWORD_PAGE = "/panel/ustawienia/haslo";

export type ConfirmNotice = "link" | "potwierdzono" | "inna-przegladarka";

/**
 * Picks the message for a failed e-mail link. Supabase verifies the link on its
 * side first and only then redirects here with a one-time `code`. Exchanging
 * that code also needs a cookie from the browser that started the flow, so it
 * fails when the link is opened elsewhere even though the e-mail is confirmed.
 * Genuinely expired or reused links arrive with `error_code` instead.
 */
export function confirmFailureNotice({
  hadCode,
  errorCode,
  next,
}: {
  hadCode: boolean;
  errorCode: string | null;
  next: string;
}): ConfirmNotice {
  if (errorCode || !hadCode) return "link";
  return next === PASSWORD_PAGE ? "inna-przegladarka" : "potwierdzono";
}
