import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { getDetected } from "@/lib/data/detected";
import { getPlanStatus } from "@/lib/data/plan";
import { FREE_PLAN_LIMIT_MESSAGE } from "@/lib/premium/plan";
import { isUuid } from "@/lib/data/subscriptions";
import { centsToInputValue } from "@/lib/money";

export const metadata: Metadata = { title: "Nowa subskrypcja" };

export default async function NewSubscriptionPage({ searchParams }: PageProps<"/panel/subskrypcje/nowa">) {
  const [{ wykryta }, plan] = await Promise.all([searchParams, getPlanStatus()]);
  const detected = typeof wykryta === "string" && isUuid(wykryta) ? await getDetected(wykryta) : null;
  const fromEmail = detected?.status === "pending" ? detected : null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Nowa subskrypcja" description="Wybierz z listy albo wpisz dowolną własną usługę." />
      {plan.slotsLeft === 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-warn/40 bg-warn/[0.07] p-4 text-sm text-warn sm:flex-row sm:items-center sm:justify-between">
          <p>{FREE_PLAN_LIMIT_MESSAGE}</p>
          <ButtonLink href="/panel/premium" size="sm" className="shrink-0">
            Zobacz Premium
          </ButtonLink>
        </div>
      )}
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
          amountIsEstimate: false,
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
