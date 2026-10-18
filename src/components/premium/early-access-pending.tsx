import { Gift } from "lucide-react";
import { resendEarlyAccessLink } from "@/actions/premium";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import type { CurrentUser } from "@/lib/data/user";
import { getEarlyAccessOffer } from "@/lib/premium/early-access";
import { EARLY_ACCESS_MONTHS, placesWord } from "@/lib/premium/plan";

const NOTICES: Record<string, { tone: "success" | "warn" | "error"; text: string }> = {
  wyslany: { tone: "success", text: "Wysłaliśmy nowy link. Sprawdź skrzynkę (także folder Spam lub Oferty)." },
  "za-wczesnie": { tone: "warn", text: "Link został wysłany przed chwilą. Poczekaj minutę i spróbuj ponownie." },
  niedostepny: { tone: "error", text: "Nie udało się wysłać linku. Spróbuj ponownie za chwilę." },
};

/** "Confirm your e-mail to get free Premium", shown until the account claims it or places run out. */
export async function EarlyAccessPending({
  user,
  returnTo,
  notice,
}: {
  user: CurrentUser;
  returnTo: "/panel" | "/panel/premium";
  notice?: string;
}) {
  const offer = await getEarlyAccessOffer(user);
  if (!offer.pending) return null;
  const message = notice ? NOTICES[notice] : undefined;

  return (
    <div className="mb-4 rounded-2xl border border-accent/40 bg-accent/10 p-5" data-testid="early-access-pending">
      <p className="flex items-center gap-2 text-lg font-semibold text-fg">
        <Gift className="size-5 text-accent" aria-hidden /> Odbierz darmowe Premium
      </p>
      <p className="mt-1.5 leading-relaxed text-muted">
        Jesteś wśród pierwszych osób: Premium na {EARLY_ACCESS_MONTHS} miesięcy czeka na Ciebie (zostało {offer.placesLeft} {placesWord(offer.placesLeft)}).
        {offer.linkSentAt ? (
          <>
            {" "}
            Wysłaliśmy link na adres <strong className="text-fg">{user.email}</strong>. Kliknij go, żeby potwierdzić adres i odebrać
            Premium.
          </>
        ) : (
          <>
            {" "}
            Za chwilę wyślemy link na adres <strong className="text-fg">{user.email}</strong>. Kliknij go, żeby potwierdzić adres i odebrać
            Premium.
          </>
        )}
      </p>
      {message && (
        <Alert tone={message.tone} className="mt-3">
          {message.text}
        </Alert>
      )}
      <form action={resendEarlyAccessLink.bind(null, returnTo)} className="mt-4">
        <SubmitButton variant="secondary" pendingText="Wysyłam…">
          {offer.linkSentAt ? "Wyślij link ponownie" : "Wyślij link"}
        </SubmitButton>
      </form>
    </div>
  );
}
