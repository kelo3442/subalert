"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BankImport } from "@/components/onboarding/bank-import";
import { todayInTimeZone } from "@/lib/dates";
import { savePendingImport } from "@/lib/import/pending-import";

/** The bank statement check without an account: results stay in the browser until sign-up. */
export function StatementCheck({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [today] = useState(() => todayInTimeZone("Europe/Warsaw"));
  return (
    <BankImport
      variant="public"
      today={today}
      isExisting={() => false}
      onConfirm={(candidates) => {
        if (candidates.length > 0) savePendingImport(candidates);
        router.push(loggedIn ? "/panel/start" : "/rejestracja");
      }}
    />
  );
}
