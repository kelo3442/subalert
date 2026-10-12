import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div>
        <p className="font-mono text-sm text-accent">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-fg">Nie znaleźliśmy tej strony</h1>
        <p className="mt-2 text-sm text-muted">Link mógł wygasnąć albo strona została usunięta.</p>
      </div>
      <ButtonLink href="/" variant="secondary">
        Strona główna
      </ButtonLink>
    </main>
  );
}
