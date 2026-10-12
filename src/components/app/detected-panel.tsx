import { Check, MailCheck, Plus, X } from "lucide-react";
import Link from "next/link";
import { acceptDetected, dismissDetected } from "@/actions/detected";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateShort } from "@/lib/dates";
import type { DetectedSubscription } from "@/lib/data/detected";
import { formatPLN } from "@/lib/money";
import { BILLING_CYCLE_SUFFIX } from "@/lib/subscriptions/billing";

export function DetectedPanel({ items }: { items: DetectedSubscription[] }) {
  const pending = items.filter((item) => item.status === "pending");
  const added = items.filter((item) => item.status === "added" && item.autoAdded);

  return (
    <Card className="overflow-hidden border-accent/30">
      <CardHeader
        icon={<MailCheck className="size-5" aria-hidden />}
        title="Wykryte w e-mailach"
        description={
          pending.length > 0
            ? `Do sprawdzenia: ${pending.length}. Rozpoznane usługi dodajemy automatycznie.`
            : "Nowe subskrypcje z przekazanych e-maili pojawią się tutaj."
        }
      />
      <ul className="mt-3 divide-y divide-line">
        {pending.map((item) => (
          <li key={item.id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <ServiceAvatar name={item.name} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">{item.name}</p>
                <p className="truncate text-xs text-muted">
                  {item.amountCents ? `${formatPLN(item.amountCents)} / ${BILLING_CYCLE_SUFFIX[item.billingCycle]}` : "kwota do uzupełnienia"}
                  {" · e-mail z "}
                  {formatDateShort(item.receivedAt.slice(0, 10))}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
              <form action={dismissDetected.bind(null, item.id)} className="contents">
                <SubmitButton variant="ghost" size="sm" aria-label={`Odrzuć ${item.name}`}>
                  <X className="size-4" aria-hidden /> Odrzuć
                </SubmitButton>
              </form>
              <form action={acceptDetected.bind(null, item.id)} className="contents">
                <SubmitButton size="sm" pendingText="Dodaję…">
                  <Plus className="size-4" aria-hidden /> {item.amountCents && item.nextPaymentDate ? "Dodaj" : "Uzupełnij"}
                </SubmitButton>
              </form>
            </div>
          </li>
        ))}
        {added.map((item) => (
          <li key={item.id}>
            <Link
              href={item.subscriptionId ? `/panel/subskrypcje/${item.subscriptionId}` : "/panel/subskrypcje"}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2"
            >
              <ServiceAvatar name={item.name} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">{item.name}</p>
                <p className="truncate text-xs text-muted">
                  {item.amountCents && `${formatPLN(item.amountCents)} / ${BILLING_CYCLE_SUFFIX[item.billingCycle]} · `}
                  e-mail z {formatDateShort(item.receivedAt.slice(0, 10))}
                </p>
              </div>
              <Badge tone="accent">
                <Check className="size-3" aria-hidden /> dodano automatycznie
              </Badge>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
