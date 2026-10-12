import type { ReactNode } from "react";

/** Distraction-free layout for onboarding: no sidebar, no bottom navigation. */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-72 w-[700px] max-w-full -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[100px]" />
      {children}
    </div>
  );
}
