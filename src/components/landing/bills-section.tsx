import { Droplets, Flame, Home, Shield, Smartphone, Trash2, Tv, Wifi, Zap } from "lucide-react";

const BILLS = [
  { icon: Zap, label: "Prąd" },
  { icon: Flame, label: "Gaz i ogrzewanie" },
  { icon: Droplets, label: "Woda i ścieki" },
  { icon: Home, label: "Czynsz" },
  { icon: Wifi, label: "Internet" },
  { icon: Smartphone, label: "Telefon" },
  { icon: Tv, label: "Telewizja i RTV" },
  { icon: Shield, label: "Ubezpieczenia" },
  { icon: Trash2, label: "Wywóz śmieci" },
];

export function BillsSection() {
  return (
    <section id="rachunki" className="scroll-mt-20 border-t border-line/60">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:gap-10 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-sm font-medium text-accent">Nie tylko subskrypcje</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Rachunki domowe też pod kontrolą</h2>
          <p className="mt-3 text-muted">
            Dodaj prąd, gaz, wodę, czynsz czy internet obok Netflixa i Spotify. Zobaczysz pełny obraz stałych wydatków, a Opłacik
            przypomni o terminie płatności.
          </p>
          <ul className="mt-6 flex flex-col gap-2 text-sm text-muted">
            <li>• Płatności co miesiąc, co 2 miesiące (jak prognozy za prąd), co kwartał, pół roku lub rok.</li>
            <li>• Kwota orientacyjna dla rachunków, które co okres są trochę inne.</li>
            <li>• Rozpoznajemy popularnych dostawców w pliku z historii konta.</li>
          </ul>
        </div>
        <ul className="grid grid-cols-3 gap-3">
          {BILLS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center transition-colors hover:border-accent/40"
            >
              <Icon className="size-6 text-accent" aria-hidden />
              <span className="text-xs font-medium text-fg sm:text-sm">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
