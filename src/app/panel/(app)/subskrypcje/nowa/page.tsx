import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { Alert } from "@/components/ui/alert";
import { getDetected } from "@/lib/data/detected";
import { isUuid } from "@/lib/data/subscriptions";
import { centsToInputValue } from "@/lib/money";

export const metadata: Metadata = { title: "Nowa subskrypcja" };

export default async function NewSubscriptionPage({ searchParams }: PageProps<"/panel/subskrypcje/nowa">) {
  const { wykryta } = await searchParams;
  const detected = typeof wykryta === "string" && isUuid(wykryta) ? await getDetected(wykryta) : null;
  const fromEmail = detected?.status === "pending" ? detected : null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Nowa subskrypcja" description="Wybierz z listy albo wpisz dowolną własną usługę." />
      {fromEmail && (
        <Alert tone="info" className="mb-4">
          Uzupełniliśmy dane wykryte w e-mailu{fromEmail.emailFrom ? ` od ${fromEmail.emailFrom}` : ""}. Sprawdź je i dopisz
          brakujące pola.
        </Alert>
      )}
      <SubscriptionForm
        mode="create"
        detectedId={fromEmail?.id}
        initialValues={{
          name: fromEmail?.name ?? "",
          amount: fromEmail?.amountCents ? centsToInputValue(fromEmail.amountCents) : "",
          billingCycle: fromEmail?.billingCycle ?? "monthly",
          nextPaymentDate: fromEmail?.nextPaymentDate ?? "",
          hasTrial: Boolean(fromEmail?.trialEndsAt),
          trialEndsAt: fromEmail?.trialEndsAt ?? "",
          category: fromEmail?.category ?? "",
          manageUrl: fromEmail?.manageUrl ?? "",
          notes: "",
          status: "active",
        }}
      />
    </div>
  );
}
