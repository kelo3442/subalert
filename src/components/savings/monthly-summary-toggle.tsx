import { setMonthlySummary } from "@/actions/savings";
import { SubmitButton } from "@/components/ui/submit-button";

/** Opt-out for the e-mail sent on the first days of each month. */
export function MonthlySummaryToggle({ enabled }: { enabled: boolean }) {
  return (
    <form action={setMonthlySummary} className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between" data-testid="monthly-summary">
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" name="monthlySummary" defaultChecked={enabled} className="mt-0.5 size-5 shrink-0 accent-[#c4f542]" />
        <span>
          <span className="block font-medium text-fg">Podsumowanie na początek miesiąca</span>
          <span className="block text-sm text-muted">Ile zapłacisz w tym miesiącu, co się odnawia i co kończy. Raz w miesiącu.</span>
        </span>
      </label>
      <SubmitButton variant="secondary" size="sm" pendingText="Zapisuję…">
        Zapisz
      </SubmitButton>
    </form>
  );
}
