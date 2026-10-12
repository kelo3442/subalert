import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";

export const metadata: Metadata = { title: "Nowa subskrypcja" };

export default function NewSubscriptionPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Nowa subskrypcja" description="Wybierz z listy albo wpisz dowolną własną usługę." />
      <SubscriptionForm
        mode="create"
        initialValues={{
          name: "",
          amount: "",
          billingCycle: "monthly",
          nextPaymentDate: "",
          hasTrial: false,
          trialEndsAt: "",
          category: "",
          manageUrl: "",
          notes: "",
          status: "active",
        }}
      />
    </div>
  );
}
