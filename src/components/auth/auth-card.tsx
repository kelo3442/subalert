import type { ReactNode } from "react";

export function AuthCard({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md animate-fade-up">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-black/30 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
        <p className="mt-1.5 text-sm text-muted">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-5 text-center text-sm text-muted">{footer}</p>
    </div>
  );
}
