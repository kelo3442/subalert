import { Database, Terminal } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/** Shown when Supabase keys are missing. Never pretends that sign-up works. */
export function SetupRequired() {
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-warn/30 bg-surface p-6 sm:p-8">
      <div className="grid size-11 place-items-center rounded-xl border border-warn/30 bg-warn/10 text-warn">
        <Database className="size-5" aria-hidden />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-fg">Logowanie nie jest jeszcze skonfigurowane</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Ta instancja Opłacika działa w trybie deweloperskim bez Supabase. Rejestracja, logowanie i zapis subskrypcji
        są wyłączone, dopóki nie dodasz kluczy projektu. Kalkulator na stronie głównej działa bez konta.
      </p>
      <div className="mt-5 rounded-xl border border-line bg-bg p-4 font-mono text-xs leading-relaxed text-muted">
        <p className="mb-2 flex items-center gap-2 text-subtle">
          <Terminal className="size-3.5" aria-hidden /> .env.local
        </p>
        <p>NEXT_PUBLIC_SUPABASE_URL=…</p>
        <p>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=…</p>
      </div>
      <p className="mt-4 text-sm text-muted">
        Instrukcja krok po kroku znajduje się w pliku <code className="text-fg">README.md</code> (sekcja „Konfiguracja Supabase”).
      </p>
      <ButtonLink href="/" variant="secondary" className="mt-6">
        Wróć na stronę główną
      </ButtonLink>
    </div>
  );
}
