import { describe, expect, it } from "vitest";
import { detectRecurring } from "./recurring";
import { buildSampleStatement } from "./sample-statement";
import { analyzeStatement, extractTransactions } from "./statement";

describe("buildSampleStatement", () => {
  it.each(["2026-10-12", "2027-01-03", "2026-03-31"])("produces a statement the importer understands (%s)", (today) => {
    const analysis = analyzeStatement(buildSampleStatement(today));
    const candidates = detectRecurring(extractTransactions(analysis.rows, analysis.mapping!), today);
    const active = candidates.filter((c) => !c.possiblyInactive).map((c) => c.name);
    expect(active).toEqual(expect.arrayContaining(["Netflix", "Spotify Premium", "Google One", "ChatGPT Plus", "Cityfit Warszawa"]));
    expect(candidates.find((c) => c.name === "Disney+")?.possiblyInactive).toBe(true);
    expect(candidates.map((c) => c.name)).not.toContain("Biedronka");
    expect(candidates.map((c) => c.name)).not.toContain("Wynagrodzenie");
  });
});
