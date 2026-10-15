import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { getLegalInfo } from "@/lib/legal";

export function SiteFooter() {
  const { contactEmail } = getLegalInfo();
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-subtle sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-sm">Opłacik pomaga pamiętać o płatnościach. Nie jest powiązany z dostawcami wymienionych usług.</p>
        </div>
        <nav aria-label="Informacje" className="flex flex-col gap-2">
          <Link href="/jak-anulowac" className="hover:text-fg">
            Jak anulować subskrypcję
          </Link>
          <Link href="/regulamin" className="hover:text-fg">
            Regulamin
          </Link>
          <Link href="/prywatnosc" className="hover:text-fg">
            Polityka prywatności
          </Link>
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="hover:text-fg">
              Kontakt: {contactEmail}
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
}
