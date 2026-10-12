import { describe, expect, it } from "vitest";
import { subscriptionsToCsv } from "./export";
import { makeSubscription } from "./subscriptions/fixtures";

describe("subscriptionsToCsv", () => {
  it("writes an Excel-friendly CSV", () => {
    const csv = subscriptionsToCsv([
      makeSubscription({ name: 'Prąd "Tauron"', amountCents: 18050, amountIsEstimate: true, billingCycle: "bimonthly", category: "utilities" }),
    ]);
    expect(csv.startsWith("﻿")).toBe(true);
    const [header, row] = csv.slice(1).trim().split("\r\n");
    expect(header.split(";")[0]).toBe('"Nazwa"');
    expect(row).toBe('"Prąd ""Tauron""";"180,50";"tak";"Co 2 miesiące";"2026-10-20";"";"Prąd, gaz, woda";"aktywna";"";""');
  });

  it("neutralises formula injection", () => {
    const csv = subscriptionsToCsv([makeSubscription({ name: "=HYPERLINK(\"x\")" })]);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  });
});
