import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { getSubscription } from "@/lib/data/subscriptions";
import { centsToInputValue } from "@/lib/money";

export const metadata: Metadata = { title: "Edycja subskrypcji" };

export default async function EditSubscriptionPage({ params }: PageProps<"/panel/subskrypcje/[id]/edytuj">) {
  const { id } = await params;
  const subscription = await getSubscription(id);
  if (!subscription) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Edytuj: ${subscription.name}`} />
      <SubscriptionForm
        mode="edit"
        subscriptionId={subscription.id}
        initialValues={{
          name: subscription.name,
          amount: centsToInputValue(subscription.amountCents),
          amountIsEstimate: subscription.amountIsEstimate,
          billingCycle: subscription.billingCycle,
          nextPaymentDate: subscription.nextPaymentDate,
          hasTrial: subscription.trialEndsAt !== null,
          trialEndsAt: subscription.trialEndsAt ?? "",
          category: subscription.category ?? "",
          manageUrl: subscription.manageUrl ?? "",
          notes: subscription.notes ?? "",
          status: subscription.status,
        }}
      />
    </div>
  );
}
