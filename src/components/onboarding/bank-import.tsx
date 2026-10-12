"use client";

import { ArrowRight, FileSpreadsheet, LoaderCircle, RotateCcw, ShieldCheck, Upload } from "lucide-react";
import { useId, useState, type ChangeEvent, type DragEvent } from "react";
import { ServiceAvatar } from "@/components/subscriptions/service-avatar";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Field, Select } from "@/components/ui/field";
import { formatDateShort, type ISODate } from "@/lib/dates";
import { decodeBankFile } from "@/lib/import/decode";
import { detectRecurring, type RecurringCandidate } from "@/lib/import/recurring";
import { buildSampleStatement } from "@/lib/import/sample-statement";
import { analyzeStatement, extractTransactions, type ColumnMapping, type StatementAnalysis } from "@/lib/import/statement";
import { formatPLN } from "@/lib/money";
import type { BillingCycle } from "@/lib/subscriptions/billing";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const CYCLE_WORDS: Record<BillingCycle, string> = {
  weekly: "co tydzień",
  monthly: "co miesiąc",
  bimonthly: "co 2 miesiące",
  quarterly: "co kwartał",
  semiannual: "co pół roku",
  yearly: "co rok",
};

interface Results {
  transactionCount: number;
  from: ISODate | null;
  to: ISODate | null;
  candidates: RecurringCandidate[];
}

function PrivacyNote() {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-accent/25 bg-accent/[0.06] p-3 text-sm text-muted">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
      <span>
        <strong className="font-medium text-fg">Plik nie opuszcza Twojego urządzenia.</strong> Analizujemy go w
        przeglądarce i nigdzie nie wysyłamy. Zapisujemy wyłącznie subskrypcje, które zaznaczysz.
      </span>
    </p>
  );
}

export function BankImport({
  today,
  isExisting,
  onConfirm,
  onManual,
}: {
  today: ISODate;
  isExisting: (name: string) => boolean;
  onConfirm: (candidates: RecurringCandidate[]) => void;
  onManual: () => void;
}) {
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [analysis, setAnalysis] = useState<StatementAnalysis | null>(null);
  const [manual, setManual] = useState({ date: "", amount: "", description: "" });
  const [results, setResults] = useState<Results | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSample, setIsSample] = useState(false);

  const finish = (rows: string[][], mapping: ColumnMapping, sample = false) => {
    const transactions = extractTransactions(rows, mapping);
    if (transactions.length === 0) {
      setError("Nie znaleźliśmy w pliku żadnych płatności wychodzących. Sprawdź, czy to historia rachunku w formacie CSV.");
      return;
    }
    const dates = transactions.map((t) => t.date).sort();
    const candidates = detectRecurring(transactions, today);
    setResults({ transactionCount: transactions.length, from: dates[0], to: dates.at(-1) ?? null, candidates });
    // Demo data is never pre-selected, so nobody saves it by accident.
    setSelected(sample ? new Set() : new Set(candidates.filter((c) => !c.possiblyInactive && !isExisting(c.name)).map((c) => c.key)));
    setIsSample(sample);
    setAnalysis(null);
  };

  const readFile = async (file: File) => {
    setError(null);
    setResults(null);
    if (file.size > MAX_FILE_BYTES) {
      setError("Plik jest za duży (maks. 5 MB). Wybierz krótszy okres, np. ostatnie 12 miesięcy.");
      return;
    }
    setBusy(true);
    try {
      const text = decodeBankFile(new Uint8Array(await file.arrayBuffer()));
      const parsed = analyzeStatement(text);
      if (parsed.rows.length < 2) {
        setError("Nie udało się odczytać pliku. Upewnij się, że to plik CSV z historią rachunku.");
      } else if (parsed.mapping) {
        finish(parsed.rows, parsed.mapping);
      } else {
        setAnalysis(parsed);
      }
    } catch {
      setError("Nie udało się odczytać pliku. Upewnij się, że to plik CSV z historią rachunku.");
    } finally {
      setBusy(false);
    }
  };

  const trySample = () => {
    setError(null);
    const parsed = analyzeStatement(buildSampleStatement(today));
    if (parsed.mapping) finish(parsed.rows, parsed.mapping, true);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void readFile(file);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void readFile(file);
  };

  const applyManualMapping = () => {
    if (!analysis || manual.date === "" || manual.amount === "" || manual.description === "") {
      setError("Wskaż wszystkie trzy kolumny.");
      return;
    }
    setError(null);
    finish(analysis.rows, {
      headerIndex: analysis.headerGuess,
      date: Number(manual.date),
      amount: Number(manual.amount),
      description: [Number(manual.description)],
      currency: null,
      state: null,
    });
  };

  const reset = () => {
    setIsSample(false);
    setResults(null);
    setAnalysis(null);
    setError(null);
  };

  if (results) {
    const chosen = results.candidates.filter((c) => selected.has(c.key));
    return (
      <div className="flex flex-col gap-4">
        {isSample && (
          <Alert tone="warn">
            To <strong className="font-semibold">przykładowe dane</strong>, żeby pokazać, jak działa wyszukiwanie. Nie
            zaznaczaj ich, jeśli to nie Twoje subskrypcje — wgraj własny plik.
          </Alert>
        )}
        <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
          Przeanalizowaliśmy <strong className="text-fg">{results.transactionCount}</strong> płatności
          {results.from && results.to && (
            <>
              {" "}z okresu {formatDateShort(results.from)} – {formatDateShort(results.to)}
            </>
          )}
          . Powtarzające się: <strong className="text-fg">{results.candidates.length}</strong>.
        </div>

        {results.candidates.length === 0 ? (
          <Alert tone="info">
            Nie znaleźliśmy regularnych płatności. Najlepiej działa plik z co najmniej 3–6 miesięcy. Możesz też zaznaczyć
            usługi ręcznie.
          </Alert>
        ) : (
          <ul className="flex flex-col gap-2">
            {results.candidates.map((candidate) => {
              const existing = isExisting(candidate.name);
              const checked = selected.has(candidate.key);
              return (
                <li key={candidate.key}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors",
                      existing && "cursor-not-allowed opacity-50",
                      checked ? "border-accent/50 bg-accent/[0.07]" : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-5 shrink-0 accent-[#c4f542]"
                      checked={checked}
                      disabled={existing}
                      onChange={(e) =>
                        setSelected((current) => {
                          const next = new Set(current);
                          if (e.target.checked) next.add(candidate.key);
                          else next.delete(candidate.key);
                          return next;
                        })
                      }
                    />
                    <ServiceAvatar name={candidate.name} className="size-9" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate font-medium text-fg">{candidate.name}</span>
                        {existing && <Badge>już dodana</Badge>}
                        {!existing && candidate.possiblyInactive && <Badge tone="warn">może już nieaktywna</Badge>}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {CYCLE_WORDS[candidate.cycle]} · ostatnio {formatDateShort(candidate.lastDate)} · {candidate.occurrences}×
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-fg">{formatPLN(candidate.amountCents)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        <div className="sticky bottom-4 z-10 flex flex-col gap-2 rounded-2xl border border-line bg-bg/90 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden /> Inny plik
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onManual}>
              Wybiorę ręcznie
            </Button>
            <Button onClick={() => onConfirm(chosen)} disabled={chosen.length === 0} className="flex-1 sm:flex-none">
              Dalej ({chosen.length}) <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (analysis) {
    const headers = analysis.rows[analysis.headerGuess] ?? [];
    const options = headers.map((cell, index) => (
      <option key={index} value={index}>
        {cell.trim() || `Kolumna ${index + 1}`}
      </option>
    ));
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="info">Nie rozpoznaliśmy automatycznie układu pliku. Wskaż, w których kolumnach są dane.</Alert>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="grid gap-4 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-3">
          {(
            [
              ["date", "Data operacji"],
              ["amount", "Kwota"],
              ["description", "Opis / odbiorca"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} id={`map-${key}`} label={label}>
              <Select id={`map-${key}`} value={manual[key]} onChange={(e) => setManual((m) => ({ ...m, [key]: e.target.value }))}>
                <option value="">wybierz</option>
                {options}
              </Select>
            </Field>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={reset}>
            Inny plik
          </Button>
          <Button onClick={applyManualMapping}>Analizuj</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PrivacyNote />
      {error && <Alert tone="error">{error}</Alert>}
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
          dragging ? "border-accent bg-accent/[0.07]" : "border-line-strong bg-surface hover:border-accent/50",
        )}
      >
        <span className="grid size-12 place-items-center rounded-2xl border border-line bg-surface-2 text-accent">
          {busy ? <LoaderCircle className="size-6 animate-spin" aria-hidden /> : <Upload className="size-6" aria-hidden />}
        </span>
        <span className="font-medium text-fg">{busy ? "Analizuję…" : "Wybierz plik CSV albo przeciągnij go tutaj"}</span>
        <span className="text-sm text-muted">Historia rachunku z ostatnich 3–12 miesięcy, maks. 5 MB</span>
        <input id={inputId} type="file" accept=".csv,text/csv,text/plain" className="sr-only" onChange={onFileChange} disabled={busy} />
      </label>

      <details className="group rounded-2xl border border-line bg-surface px-4 [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 py-3 text-sm font-medium text-fg">
          <FileSpreadsheet className="size-4 text-accent" aria-hidden /> Jak pobrać plik z banku?
        </summary>
        <ol className="flex list-decimal flex-col gap-1.5 pb-4 pl-5 text-sm text-muted">
          <li>Zaloguj się do bankowości internetowej w przeglądarce na komputerze.</li>
          <li>Otwórz historię rachunku (czasem: „Historia”, „Operacje”, „Transakcje”).</li>
          <li>Ustaw okres na ostatnie 6–12 miesięcy.</li>
          <li>Wybierz eksport lub pobranie i format <strong className="text-fg">CSV</strong>.</li>
          <li>Wgraj pobrany plik tutaj.</li>
        </ol>
      </details>

      <div className="flex flex-col gap-1 sm:flex-row">
        <Button variant="ghost" className="justify-start" onClick={trySample}>
          Nie masz pliku? Zobacz na przykładowych danych
        </Button>
        <Button variant="ghost" className="justify-start" onClick={onManual}>
          Wolę zaznaczyć usługi ręcznie
        </Button>
      </div>
    </div>
  );
}
