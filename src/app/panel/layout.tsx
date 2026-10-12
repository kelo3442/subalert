import type { ReactNode } from "react";
import { SetupRequired } from "@/components/auth/setup-required";
import { requireUser } from "@/lib/data/user";
import { isSupabaseConfigured } from "@/lib/env";

/** Gate for every /panel route; the app shell lives in the (app) group. */
export default async function PanelGateLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-10">
        <SetupRequired />
      </main>
    );
  }
  await requireUser();
  return children;
}
