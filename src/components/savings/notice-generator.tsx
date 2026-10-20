"use client";

import { Check, Copy, Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { buildNoticeLetter, type NoticeLetterInput } from "@/lib/savings/notice-letter";

function todayPL() {
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());
}

/** Fills in a termination letter. Everything stays in this browser tab. */
export function NoticeGenerator({ kind, service }: { kind: NoticeLetterInput["kind"]; service: string }) {
  const [form, setForm] = useState<NoticeLetterInput>({
    kind,
    city: "",
    date: todayPL(),
    fullName: "",
    address: "",
    company: "",
    service,
    contractNumber: "",
    vehicle: "",
    policyEnd: "",
  });
  const [copied, setCopied] = useState(false);
  const letter = buildNoticeLetter(form);
  const set = (key: keyof NoticeLetterInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCopied(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const print = () => {
    const w = window.open("", "_blank", "noopener=no");
    if (!w) return;
    w.document.title = "Wypowiedzenie umowy";
    const pre = w.document.createElement("pre");
    pre.textContent = letter;
    pre.style.cssText = "font:14px/1.6 Georgia,serif;white-space:pre-wrap;margin:48px";
    w.document.body.appendChild(pre);
    w.focus();
    w.print();
  };

  const fields: [keyof NoticeLetterInput, string, string?][] = [
    ["fullName", "Imię i nazwisko"],
    ["address", "Adres", "ulica, kod pocztowy, miasto"],
    ["company", kind === "oc" ? "Ubezpieczyciel" : "Firma", kind === "oc" ? "np. nazwa towarzystwa" : "np. nazwa siłowni lub operatora"],
    ...(kind === "oc"
      ? ([
          ["contractNumber", "Numer polisy"],
          ["vehicle", "Pojazd", "marka i numer rejestracyjny"],
          ["policyEnd", "Koniec obecnej polisy", "dd.mm.rrrr"],
        ] as [keyof NoticeLetterInput, string, string?][])
      : ([
          ["service", "Usługa", "np. karnet, abonament internetowy"],
          ["contractNumber", "Numer umowy lub klienta (jeśli masz)"],
        ] as [keyof NoticeLetterInput, string, string?][])),
    ["city", "Miejscowość"],
    ["date", "Data"],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([key, label, placeholder]) => (
          <Field key={key} id={`nl-${key}`} label={label}>
            <Input id={`nl-${key}`} value={form[key]} placeholder={placeholder} onChange={set(key)} autoComplete="off" />
          </Field>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <pre className="min-h-80 whitespace-pre-wrap rounded-2xl border border-line bg-surface p-5 font-serif text-sm leading-relaxed text-fg" data-testid="notice-letter">
          {letter}
        </pre>
        <div className="flex flex-wrap gap-2">
          <Button onClick={copy}>
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />} {copied ? "Skopiowano" : "Kopiuj tekst"}
          </Button>
          <Button variant="secondary" onClick={print}>
            <Printer className="size-4" aria-hidden /> Drukuj lub zapisz PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
