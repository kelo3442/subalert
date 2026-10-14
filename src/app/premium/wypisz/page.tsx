import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeWaitlist } from "@/actions/waitlist";
import { Alert } from "@/components/ui/alert";
import { Logo } from "@/components/ui/logo";
import { SubmitButton } from "@/components/ui/submit-button";

export const metadata: Metadata = { title: "Wypisz się z listy Premium", robots: { index: false } };

export default async function UnsubscribePage({ searchParams }: PageProps<"/premium/wypisz">) {
  const { t, wypisano, blad } = await searchParams;
  const token = typeof t === "string" ? t : "";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-md rounded-2xl border border-line bg-surface p-6">
        <h1 className="text-xl font-semibold text-fg">Lista chętnych na Premium</h1>
        {wypisano ? (
          <Alert tone="success" className="mt-4">
            Wypisano. Nie wyślemy Ci już wiadomości o starcie Premium.
          </Alert>
        ) : blad || !token ? (
          <Alert tone="error" className="mt-4">
            Ten link jest nieprawidłowy. Napisz do nas, jeśli chcesz zostać wypisany.
          </Alert>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">Nie chcesz dostać wiadomości, gdy Opłacik Premium wystartuje? Wypisz się jednym kliknięciem.</p>
            <form action={unsubscribeWaitlist.bind(null, token)} className="mt-5">
              <SubmitButton pendingText="Wypisuję…">Wypisz mnie</SubmitButton>
            </form>
          </>
        )}
        <Link href="/" className="mt-6 inline-block text-sm text-accent hover:underline">
          Strona główna
        </Link>
      </div>
    </main>
  );
}
