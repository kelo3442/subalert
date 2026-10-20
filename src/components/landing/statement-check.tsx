"use client";

import { FileSpreadsheet, MousePointerClick } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BankImport } from "@/components/onboarding/bank-import";
import { cn } from "@/components/ui/cn";
import { todayInTimeZone } from "@/lib/dates";
import { savePendingImport } from "@/lib/import/pending-import";
import type { RecurringCandidate } from "@/lib/import/recurring";
import { QuickCheck } from "./quick-check";

/** The check without an account: from a bank file or by ticking services. Results stay in the browser until sign-up. */
export function StatementCheck({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [today] = useState(() => todayInTimeZone("Europe/Warsaw"));
  const [mode, setMode] = useState<"file" | "pick">("file");
  const save = (candidates: RecurringCandidate[]) => {
    if (candidates.length > 0) savePendingImport(candidates);
    router.push(loggedIn ? "/panel/start" : "/rejestracja");
  };
  const tab = (active: boolean) =>
    cn(
      "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      active ? "bg-surface-3 text-fg" : "text-muted hover:text-fg",
    );
  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Sposób sprawdzenia" className="flex rounded-xl border border-line bg-surface p-1">
        <button type="button" role="tab" aria-selected={mode === "file"} className={tab(mode === "file")} onClick={() => setMode("file")}>
          <FileSpreadsheet className="size-4" aria-hidden /> Plik z banku
        </button>
        <button type="button" role="tab" aria-selected={mode === "pick"} className={tab(mode === "pick")} onClick={() => setMode("pick")}>
          <MousePointerClick className="size-4" aria-hidden /> Zaznaczę sam
        </button>
      </div>
      {mode === "file" ? (
        <BankImport variant="public" today={today} isExisting={() => false} onConfirm={save} />
      ) : (
        <QuickCheck onSave={save} />
      )}
    </div>
  );
}
