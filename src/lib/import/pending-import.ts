import type { RecurringCandidate } from "./recurring";

/**
 * Payments picked on the public statement check (/sprawdz) wait in this browser
 * until the person creates an account, then the quick start offers to save them.
 * Only the picked items are kept (name, amount, cycle), never the bank file.
 */
export const PENDING_IMPORT_KEY = "oplacik:pending-import";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface Stored {
  savedAt: number;
  candidates: RecurringCandidate[];
}

function isCandidate(value: unknown): value is RecurringCandidate {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.key === "string" &&
    typeof c.name === "string" &&
    typeof c.amountCents === "number" &&
    typeof c.cycle === "string" &&
    typeof c.nextPaymentDate === "string"
  );
}

export function savePendingImport(candidates: RecurringCandidate[], now = Date.now()): void {
  try {
    const value: Stored = { savedAt: now, candidates };
    window.localStorage.setItem(PENDING_IMPORT_KEY, JSON.stringify(value));
  } catch {
    // Storage blocked (private mode): the person will add the items again after signing up.
  }
}

/** Reads and removes the pending items; returns [] when there are none or they are older than a day. */
export function takePendingImport(now = Date.now()): RecurringCandidate[] {
  try {
    const raw = window.localStorage.getItem(PENDING_IMPORT_KEY);
    if (!raw) return [];
    window.localStorage.removeItem(PENDING_IMPORT_KEY);
    return parsePendingImport(raw, now);
  } catch {
    return [];
  }
}

export function parsePendingImport(raw: string, now = Date.now()): RecurringCandidate[] {
  try {
    const data = JSON.parse(raw) as Partial<Stored>;
    if (typeof data.savedAt !== "number" || now - data.savedAt > MAX_AGE_MS || !Array.isArray(data.candidates)) return [];
    return data.candidates.filter(isCandidate).slice(0, 50);
  } catch {
    return [];
  }
}
