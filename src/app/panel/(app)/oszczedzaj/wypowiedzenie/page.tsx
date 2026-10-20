import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { NoticeGenerator } from "@/components/savings/notice-generator";
import { Alert } from "@/components/ui/alert";
import { getSubscription, isUuid } from "@/lib/data/subscriptions";

export const metadata: Metadata = { title: "Wypowiedzenie umowy" };

export default async function NoticePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const id = typeof params.id === "string" && isUuid(params.id) ? params.id : null;
  const subscription = id ? await getSubscription(id) : null;
  const kind = params.typ === "oc" ? "oc" : "general";

  return (
    <>
      <PageHeader
        back={
          <Link href="/panel/oszczedzaj" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
            <ArrowLeft className="size-4" aria-hidden /> Oszczędzaj
          </Link>
        }
        title={kind === "oc" ? "Wypowiedzenie OC" : "Wypowiedzenie umowy"}
        description="Uzupełnij dane, a pismo ułoży się samo. Wydrukuj i podpisz albo wyślij zgodnie z zasadami w umowie."
      />
      <p className="mb-4 flex items-start gap-2 text-sm text-subtle">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        Dane wpisujesz tylko w tej karcie przeglądarki. Opłacik ich nie zapisuje ani nigdzie nie wysyła.
      </p>
      {kind === "oc" && (
        <Alert tone="info" className="mb-4">
          Umowa OC przedłuża się sama na kolejne 12 miesięcy, jeśli jej nie wypowiesz przed końcem. Złóż wypowiedzenie przed końcem obecnej
          polisy, najlepiej z kilkudniowym zapasem, i zachowaj potwierdzenie wysyłki. Nie zostawaj bez OC ani na jeden dzień: nową polisę
          kup tak, żeby zaczynała się, gdy kończy się stara.
        </Alert>
      )}
      <NoticeGenerator kind={kind} service={subscription?.name ?? ""} />
      <p className="mt-6 text-xs leading-relaxed text-subtle">
        To wzór ogólny, nie porada prawna. Okres wypowiedzenia i sposób jego złożenia (np. pisemnie, mailem, w aplikacji) sprawdzisz w swojej
        umowie lub regulaminie usługi.
      </p>
    </>
  );
}
