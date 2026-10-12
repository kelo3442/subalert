import { Logo } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo />
        <p>SubAlert pomaga pamiętać o płatnościach. Nie jest powiązany z dostawcami wymienionych usług.</p>
      </div>
    </footer>
  );
}
