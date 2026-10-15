import { isValidISODate, type ISODate } from "@/lib/dates";
import { parseCsv } from "./csv";

export interface ColumnMapping {
  headerIndex: number;
  date: number;
  amount: number;
  description: number[];
  currency: number | null;
  state: number | null;
  /** The amount column lists only money going out, as positive numbers ("Obciążenia", "Wypływy"). */
  amountIsDebit?: boolean;
}

export interface Transaction {
  date: ISODate;
  /** Money that left the account, in grosze (always positive). */
  amountCents: number;
  description: string;
}

export interface StatementAnalysis {
  rows: string[][];
  mapping: ColumnMapping | null;
  /** Best guess of the header row, used to let the user map columns manually. */
  headerGuess: number;
}

const DELIMITERS = [";", ",", "\t"];
const HEADER_SCAN_ROWS = 60;

export function normalizeHeader(cell: string): string {
  return cell.replace(/^#/, "").trim().toLocaleLowerCase("pl");
}

const DATE_PREFERENCES = [/data operacji/, /data transakcji/, /started date/, /^data$/, /^date$/, /completed date/, /data ksi[eę]gowania/, /data/, /date/];
const AMOUNT_EXCLUDE = /saldo|balance|fee|prowizj/;
const AMOUNT_PREFERENCES = [/kwota transakcji/, /kwota operacji/, /^kwota$/, /^amount$/, /kwota/, /amount/];
// Banks that split money out and money in into two columns.
const DEBIT_PATTERN = /obci[aą][zż]eni|wyp[lł]yw|^debet|^debit|money out|paid out|^wydatki|^wyp[lł]aty/;
const DESCRIPTION_PATTERN = /opis|tytu[lł]|kontrahent|odbiorc|nadawc|nazwa|description|merchant|lokalizacja|szczeg/;

function findColumn(headers: string[], preferences: RegExp[], exclude?: RegExp): number {
  for (const pattern of preferences) {
    const index = headers.findIndex((h) => pattern.test(h) && !(exclude && exclude.test(h)));
    if (index !== -1) return index;
  }
  return -1;
}

export function detectColumns(rows: string[][]): ColumnMapping | null {
  for (let i = 0; i < Math.min(rows.length, HEADER_SCAN_ROWS); i += 1) {
    const headers = rows[i].map(normalizeHeader);
    const date = findColumn(headers, DATE_PREFERENCES);
    const signed = findColumn(headers, AMOUNT_PREFERENCES, AMOUNT_EXCLUDE);
    const debit = headers.findIndex((h) => DEBIT_PATTERN.test(h) && !AMOUNT_EXCLUDE.test(h));
    const amount = signed !== -1 ? signed : debit;
    if (date === -1 || amount === -1) continue;
    const description = headers.flatMap((h, index) => (DESCRIPTION_PATTERN.test(h) ? [index] : []));
    const currency = headers.findIndex((h) => /^waluta$|^currency$/.test(h));
    const state = headers.findIndex((h) => /^state$|^status$/.test(h));
    return {
      headerIndex: i,
      date,
      amount,
      description,
      currency: currency === -1 ? null : currency,
      state: state === -1 ? null : state,
      amountIsDebit: signed === -1,
    };
  }
  return null;
}

export function analyzeStatement(text: string): StatementAnalysis {
  let fallback: StatementAnalysis | null = null;
  for (const delimiter of DELIMITERS) {
    const rows = parseCsv(text, delimiter);
    const mapping = detectColumns(rows);
    if (mapping) return { rows, mapping, headerGuess: mapping.headerIndex };
    const widest = rows.slice(0, HEADER_SCAN_ROWS).reduce((best, row, index, all) => (row.length > all[best].length ? index : best), 0);
    if (!fallback || (rows[widest]?.length ?? 0) > (fallback.rows[fallback.headerGuess]?.length ?? 0)) {
      fallback = { rows, mapping: null, headerGuess: widest };
    }
  }
  return fallback ?? { rows: [], mapping: null, headerGuess: 0 };
}

/** Accepts 2026-10-05, 2026.10.05, 05-10-2026, 05.10.2026 (optionally followed by a time). */
export function parseStatementDate(value: string): ISODate | null {
  const trimmed = value.trim();
  let match = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/.exec(trimmed);
  let iso: string | null = null;
  if (match) iso = `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  match = /^(\d{1,2})[-./](\d{1,2})[-./](\d{4})/.exec(trimmed);
  if (!iso && match) iso = `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  return iso && isValidISODate(iso) ? iso : null;
}

/** Parses "-1 299,00", "−49,00 PLN", "-49.00", "-1,299.00" into signed grosze. */
export function parseSignedAmount(value: string): number | null {
  let s = value
    .replace(/[\s ]/g, "")
    .replace(/−/g, "-")
    // Spreadsheet-safe exports: '-49,00 or ="-49,00"
    .replace(/^=?["']+|["']+$/g, "")
    .replace(/^[a-zA-Z]{3}(?=[-+\d])/, "")
    .replace(/[a-zA-Złł]+$/u, "")
    .replace(/^\+/, "");
  if (!/^-?[\d.,]+$/.test(s)) return null;
  const negative = s.startsWith("-");
  s = s.replace("-", "");
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  const decimalIndex = Math.max(lastComma, lastDot);
  let whole = s;
  let fraction = "";
  if (decimalIndex !== -1 && s.length - decimalIndex - 1 <= 2) {
    whole = s.slice(0, decimalIndex);
    fraction = s.slice(decimalIndex + 1);
  }
  whole = whole.replace(/[.,]/g, "");
  if (!/^\d+$/.test(whole || "0") || !/^\d{0,2}$/.test(fraction)) return null;
  const cents = Number(whole || "0") * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) return null;
  return negative ? -cents : cents;
}

const SKIPPED_STATES = /declined|reverted|failed|odrzucon|anulowan/i;

/** Outgoing PLN payments from the statement; incoming money and other currencies are ignored. */
export function extractTransactions(rows: string[][], mapping: ColumnMapping): Transaction[] {
  const transactions: Transaction[] = [];
  for (const row of rows.slice(mapping.headerIndex + 1)) {
    const date = parseStatementDate(row[mapping.date] ?? "");
    const parsed = parseSignedAmount(row[mapping.amount] ?? "");
    // In a money-out column every non-zero value is a payment, whatever its sign.
    const amount = parsed !== null && mapping.amountIsDebit ? -Math.abs(parsed) : parsed;
    if (!date || amount === null || amount >= 0) continue;
    if (mapping.currency !== null) {
      const currency = (row[mapping.currency] ?? "").trim().toUpperCase();
      if (currency && currency !== "PLN") continue;
    }
    if (mapping.state !== null && SKIPPED_STATES.test(row[mapping.state] ?? "")) continue;
    const description = mapping.description
      .map((index) => (row[index] ?? "").trim())
      .filter(Boolean)
      .join(" ");
    transactions.push({ date, amountCents: -amount, description });
  }
  return transactions;
}
