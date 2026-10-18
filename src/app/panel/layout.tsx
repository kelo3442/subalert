import { after } from "next/server";
import type { ReactNode } from "react";
import { SetupRequired } from "@/components/auth/setup-required";
import { isWelcomeEmailPending, requireUser } from "@/lib/data/user";
import { isSupabaseConfigured } from "@/lib/env";
import { claimEarlyAccess } from "@/lib/premium/early-access";
import { sendWelcomeEmailOnce } from "@/lib/welcome/send";

/** Gate for every /panel route; the app shell lives in the (app) group. */
export default async function PanelGateLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-10">
        <SetupRequired />
      </main>
    );
  }
  const user = await requireUser();
  if (await isWelcomeEmailPending()) {
    // First visit of a new account: launch Premium (while places last) before the page renders.
    await claimEarlyAccess(user.id);
    after(() => sendWelcomeEmailOnce(user));
  }
  return children;
}
