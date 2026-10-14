import { CircleCheck, ExternalLink, LifeBuoy, RotateCcw } from "lucide-react";
import { setSubscriptionStatus } from "@/actions/subscriptions";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateLong } from "@/lib/dates";
import { findPopularService, GENERIC_CANCEL_STEPS } from "@/lib/subscriptions/popular-services";
import type { Subscription } from "@/lib/subscriptions/types";

export function CancelAssistant({ subscription }: { subscription: Subscription }) {
  const preset = findPopularService(subscription.name);
  const steps = preset?.cancelSteps ?? GENERIC_CANCEL_STEPS;
  const cancelled = subscription.status === "cancelled";

  return (
    <Card>
      <CardHeader
        icon={<LifeBuoy className="size-5" aria-hidden />}
        title="Cancel Assistant"
        description="Opłacik nie anuluje usług za Ciebie — pomaga szybko trafić we właściwe miejsce."
      />
      <div className="flex flex-col gap-5 p-5">
        {subscription.manageUrl ? (
          <a
            href={subscription.manageUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={buttonClasses("secondary", "md", "self-start")}
          >
            Otwórz stronę zarządzania <ExternalLink className="size-4" aria-hidden />
          </a>
        ) : (
          <p className="text-sm text-muted">
            Nie zapisano linku do zarządzania. Dodaj go w edycji subskrypcji, żeby mieć go pod ręką.
          </p>
        )}

        <div>
          <h3 className="text-sm font-medium text-fg">{preset ? `Jak anulować ${preset.name}` : "Jak zwykle anuluje się subskrypcję"}</h3>
          <ol className="mt-2 flex flex-col gap-2">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-muted">
                <span className="grid size-5 shrink-0 place-items-center rounded-full border border-line text-[11px] text-subtle">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-subtle">
            Wskazówki są ogólne, a dostawcy zmieniają swoje strony. W razie wątpliwości sprawdź pomoc na oficjalnej stronie usługi.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface-2 p-4">
          {cancelled ? (
            <>
              <p className="flex items-center gap-2 text-sm font-medium text-accent">
                <CircleCheck className="size-4" aria-hidden />
                Oznaczona jako anulowana przez Ciebie
                {subscription.cancelledAt && ` (${formatDateLong(subscription.cancelledAt.slice(0, 10))})`}
              </p>
              <p className="mt-1 text-xs text-muted">Nie liczymy jej do wydatków i nie wysyłamy przypomnień.</p>
              <form action={setSubscriptionStatus.bind(null, subscription.id, "active")} className="mt-3">
                <SubmitButton variant="ghost" size="sm" pendingText="Zapisywanie…">
                  <RotateCcw className="size-4" aria-hidden /> Przywróć jako aktywną
                </SubmitButton>
              </form>
            </>
          ) : (
            <>
              <p className="text-sm text-fg">Anulowałeś już tę usługę u dostawcy?</p>
              <p className="mt-1 text-xs text-muted">
                Oznacz ją — przestaniemy liczyć ją do wydatków i wysyłać przypomnienia. Pozycja zostanie w historii.
              </p>
              <form action={setSubscriptionStatus.bind(null, subscription.id, "cancelled")} className="mt-3">
                <SubmitButton variant="secondary" size="sm" pendingText="Zapisywanie…">
                  <CircleCheck className="size-4" aria-hidden /> Tak, anulowałem samodzielnie
                </SubmitButton>
              </form>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
