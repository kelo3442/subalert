import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { detectRecurring } from "./recurring";
import { analyzeRows, extractTransactions, parseStatementDate } from "./statement";
import { isLegacyOfficeFile, isPdfFile, isZipFile, xlsxToRows } from "./xlsx";

const file = new Uint8Array(readFileSync(new URL("./fixtures/mbank-excel.xlsx", import.meta.url)));

describe("Excel bank exports", () => {
  it("recognises file types by their first bytes", () => {
    expect(isZipFile(file)).toBe(true);
    expect(isLegacyOfficeFile(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0]))).toBe(true);
    expect(isPdfFile(new TextEncoder().encode("%PDF-1.7"))).toBe(true);
    expect(isZipFile(new TextEncoder().encode("Data;Kwota"))).toBe(false);
  });

  it("reads the first worksheet, Excel dates and float amounts", async () => {
    const rows = await xlsxToRows(file);
    const analysis = analyzeRows(rows);
    expect(analysis.mapping).toMatchObject({ date: 0, amount: 4 });
    const transactions = extractTransactions(analysis.rows, analysis.mapping!);
    expect(transactions).toHaveLength(11);
    expect(transactions[0]).toEqual({ date: "2026-06-05", amountCents: 4900, description: "NETFLIX.COM  AMSTERDAM  Płatność kartą" });
    expect(transactions.at(-1)).toMatchObject({ date: "2026-10-01", amountCents: 30 });
    expect(detectRecurring(transactions, "2026-10-15").map((c) => c.name)).toEqual(expect.arrayContaining(["Netflix", "Spotify Premium"]));
  });

  it("converts Excel serial dates", () => {
    expect(parseStatementDate("46310")).toBe("2026-10-15");
    expect(parseStatementDate("46310.5")).toBe("2026-10-15");
    expect(parseStatementDate("12345")).toBeNull();
  });
});
