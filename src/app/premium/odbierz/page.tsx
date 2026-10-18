import { Gift } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redeemEarlyAccess } from "@/actions/premium";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateLong } from "@/lib/dates";
import { EARLY_ACCESS_LIMIT, EARLY_ACCESS_MONTHS } from "@/lib/premium/plan";

export const metadata: Metadata = { title: "Odbierz darmowe Premium", robots: { index: false } };

/**
 * Opened from the link in the welcome e-mail. Claiming needs a button press
 * (not just opening the page) so mail scanners that open links do not use it.
 */
export default async function ClaimEarlyAccessPage({ searchParams }: PageProps<"/premium/odbierz">) {
  const { t, wynik, do: until } = await searchParams;
  const token = typeof t === "string" ? t : "";
  const untilText = typeof until === "string" && /^\d{4}-\d{2}-\d{2}$/.test(until) ? formatDateLong(until) : null;
  const goToApp = (
    <Link href="/panel" className={buttonClasses("primary", "lg", "mt-5 w-full")}>
      Przejdź do Opłacika
    </Link>
  );

  let body;
  if (wynik === "claimed" || wynik === "already") {
    body = (
      <>
        <Alert tone="success" className="mt-4">
          {wynik === "claimed" ? "Gotowe! Masz Premium za darmo" : "To konto ma już darmowe Premium"}
          {untilText ? ` do ${untilText}` : ""}. Potem konto wróci do darmowego planu, nic nie zapłacisz.
        </Alert>
        {goToApp}
      </>
    );
  } else if (wynik === "full") {
    body = (
      <>
        <Alert tone="info" className="mt-4">
          Niestety, wszystkie {EARLY_ACCESS_LIMIT} miejsc zostało już rozdanych. Twoje konto działa dalej w darmowym planie.
        </Alert>
        {goToApp}
      </>
    );
  } else if (wynik === "invalid" || !token) {
    body = (
      <>
        <Alert tone="error" className="mt-4">
          Ten link jest nieaktualny. Zaloguj się do Opłacika i kliknij „Wyślij link ponownie”, a dostaniesz nowy.
        </Alert>
        {goToApp}
      </>
    );
  } else {
    body = (
      <>
        <p className="mt-2 text-muted">
          Kliknij przycisk, żeby potwierdzić swój adres e-mail i odebrać Premium za darmo na {EARLY_ACCESS_MONTHS} miesięcy. Bez karty i bez
          opłat po tym czasie.
        </p>
        <form action={redeemEarlyAccess.bind(null, token)} className="mt-5">
          <SubmitButton size="lg" className="w-full" pendingText="Odbieram…">
            Odbierz darmowe Premium
          </SubmitButton>
        </form>
      </>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-md rounded-2xl border border-line bg-surface p-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-fg">
          <Gift className="size-5 text-accent" aria-hidden /> Darmowe Premium na start
        </h1>
        <div data-testid="claim-result">{body}</div>
      </div>
    </main>
  );
}
