import { describe, expect, it } from "vitest";
import { parsePendingImport } from "./pending-import";

const candidate = {
  key: "netflix",
  name: "Netflix",
  category: "video",
  manageUrl: null,
  knownService: true,
  amountCents: 4900,
  cycle: "monthly",
  occurrences: 4,
  lastDate: "2026-10-05",
  nextPaymentDate: "2026-11-05",
  possiblyInactive: false,
  singleCharge: false,
};

describe("parsePendingImport", () => {
  const now = Date.UTC(2026, 9, 20, 12);

  it("returns saved items from the last day", () => {
    const raw = JSON.stringify({ savedAt: now - 60_000, candidates: [candidate] });
    expect(parsePendingImport(raw, now)).toEqual([candidate]);
  });

  it("drops items older than a day", () => {
    const raw = JSON.stringify({ savedAt: now - 25 * 60 * 60 * 1000, candidates: [candidate] });
    expect(parsePendingImport(raw, now)).toEqual([]);
  });

  it("ignores broken data", () => {
    expect(parsePendingImport("not json", now)).toEqual([]);
    expect(parsePendingImport(JSON.stringify({ savedAt: now, candidates: [{ name: 1 }, candidate] }), now)).toEqual([candidate]);
  });
});
