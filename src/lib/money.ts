/**
 * Amounts are stored as integer grosze (1 PLN = 100 gr) to avoid floating
 * point errors when summing many subscriptions.
 */
export const MAX_AMOUNT_CENTS = 10_000_000; // 100 000 zł

const AMOUNT_PATTERN = /^\d{1,7}([.,]\d{1,2})?$/;

/** Parses user input such as "49,99", "49.9" or "1 299" into grosze. */
export function parseAmountToCents(input: string): number | null {
  const normalized = input.replace(/[\s ]/g, "").replace(/zł$/i, "");
  if (!AMOUNT_PATTERN.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.replace(",", ".").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

const plnFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPLN(cents: number): string {
  return plnFormatter.format(cents / 100);
}

/** Value suitable for a text input, e.g. 4999 → "49,99". */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
