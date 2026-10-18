import { after } from "next/server";
import type { ReactNode } from "react";
import { SetupRequired } from "@/components/auth/setup-required";
import { isWelcomeEmailPending, requireUser } from "@/lib/data/user";
import { isSupabaseConfigured } from "@/lib/env";
import { claimEarlyAccessOnSignup } from "@/lib/premium/early-access";
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
    // First visit of a new account. Launch Premium needs a confirmed address:
    // Google sign-ins get it now, everyone else via the link in the welcome e-mail.
    await claimEarlyAccessOnSignup(user);
    after(() => sendWelcomeEmailOnce(user));
  }
  return children;
}
