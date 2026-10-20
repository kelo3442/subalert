import { ThumbsDown, ThumbsUp } from "lucide-react";
import { answerUsage } from "@/actions/savings";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatPLN } from "@/lib/money";
import { BILLING_CYCLE_SUFFIX } from "@/lib/subscriptions/billing";
import type { Subscription } from "@/lib/subscriptions/types";

/** Once a month: "Korzystałeś z tego w ostatnim miesiącu?" with one tap per plan. */
export function UsageQuestions({ questions }: { questions: Subscription[] }) {
  if (questions.length === 0) return null;
  return (
    <Card id="uzywanie" className="scroll-mt-24" data-testid="usage-questions">
      <CardHeader
        title={<span className="text-lg">Korzystałeś z tego w ostatnim miesiącu?</span>}
        description="Jedno kliknięcie na usługę. Gdy czegoś nie używasz, podpowiemy, ile oszczędzisz."
      />
      <ul className="mt-3 divide-y divide-line">
        {questions.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-5 py-3">
            <ServiceAvatar name={s.name} className="size-10" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-fg">{s.name}</span>
              <span className="text-sm tabular-nums text-muted">
                {formatPLN(s.amountCents)}/{BILLING_CYCLE_SUFFIX[s.billingCycle]}
              </span>
            </span>
            <form action={answerUsage.bind(null, s.id, true)}>
              <SubmitButton variant="secondary" size="sm" aria-label={`${s.name}: tak, korzystam`}>
                <ThumbsUp className="size-4" aria-hidden /> Tak
              </SubmitButton>
            </form>
            <form action={answerUsage.bind(null, s.id, false)}>
              <SubmitButton variant="secondary" size="sm" aria-label={`${s.name}: nie korzystam`}>
                <ThumbsDown className="size-4" aria-hidden /> Nie
              </SubmitButton>
            </form>
          </li>
        ))}
      </ul>
    </Card>
  );
}
