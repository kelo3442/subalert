/** Maps Supabase Auth error codes to messages shown to the user. */
const MESSAGES: Record<string, string> = {
  invalid_credentials: "Nieprawidłowy e-mail lub hasło.",
  email_not_confirmed: "Potwierdź adres e-mail, klikając link z wiadomości, którą wysłaliśmy.",
  user_already_exists: "Konto z tym adresem e-mail już istnieje. Zaloguj się.",
  email_exists: "Konto z tym adresem e-mail już istnieje. Zaloguj się.",
  weak_password: "Hasło jest zbyt słabe. Użyj dłuższego hasła z literami i cyframi.",
  over_email_send_rate_limit: "Wysłaliśmy już kilka wiadomości. Spróbuj ponownie za kilka minut.",
  over_request_rate_limit: "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.",
  signup_disabled: "Rejestracja jest obecnie wyłączona.",
  same_password: "Nowe hasło musi różnić się od obecnego.",
  email_address_invalid: "Ten adres e-mail nie jest akceptowany. Użyj innego adresu.",
};

export const GENERIC_AUTH_ERROR = "Coś poszło nie tak. Spróbuj ponownie za chwilę.";

export function authErrorMessage(error: { code?: string; status?: number } | null | undefined): string {
  if (!error) return GENERIC_AUTH_ERROR;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  if (error.status === 429) return MESSAGES.over_request_rate_limit;
  return GENERIC_AUTH_ERROR;
}
