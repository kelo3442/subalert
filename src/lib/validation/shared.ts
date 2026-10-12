import { z } from "zod";
import { isValidISODate } from "@/lib/dates";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

export function isoDateField(requiredMessage: string) {
  return z
    .string(requiredMessage)
    .trim()
    .min(1, requiredMessage)
    .refine(isValidISODate, "Podaj poprawną datę.")
    .refine((value) => {
      const year = Number(value.slice(0, 4));
      return year >= MIN_YEAR && year <= MAX_YEAR;
    }, `Data musi mieścić się w latach ${MIN_YEAR}–${MAX_YEAR}.`);
}

/** Turns "" into undefined so optional form fields can stay empty. */
export function emptyToUndefined(value: unknown): unknown {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export type FieldErrors<T extends string = string> = Partial<Record<T, string[]>>;

export function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
