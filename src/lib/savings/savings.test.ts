import { describe, expect, it } from "vitest";
import { getCancelGuide } from "@/lib/cancel-guides/data";
import { makeSubscription } from "@/lib/subscriptions/fixtures";
import { cancelGuideSlug } from "./guides";
import { findOverlaps, overlapTitle } from "./overlaps";
import { computeSavings, priciestOptional } from "./savings";

describe("computeSavings", () => {
  it("adds up cancelled plans and money kept since cancelling", () => {
    const now = new Date("2026-12-31T00:00:00Z");
    const result = computeSavings(
      [
        makeSubscription({ name: "Netflix", amountCents: 6000, status: "cancelled", cancelledAt: "2026-07-04T00:00:00Z" }),
        makeSubscription({ name: "Spotify", amountCents: 2399 }),
        makeSubscription({ name: "Bez daty", status: "cancelled", cancelledAt: null }),
      ],
      now,
    );
    expect(result.yearlyCents).toBe(72000);
    // 180 days of a 720 zł/year plan
    expect(result.savedSoFarCents).toBe(Math.round((72000 * 180) / 365));
    expect(result.items).toHaveLength(1);
  });

  it("is empty with nothing cancelled", () => {
    expect(computeSavings([makeSubscription()]).yearlyCents).toBe(0);
  });
});

describe("priciestOptional", () => {
  it("skips bills and cancelled plans", () => {
    const list = priciestOptional([
      makeSubscription({ name: "Czynsz", amountCents: 150000, category: "housing" }),
      makeSubscription({ name: "Siłownia", amountCents: 14900, category: "fitness" }),
      makeSubscription({ name: "Netflix", amountCents: 4900 }),
      makeSubscription({ name: "HBO", amountCents: 9900, status: "cancelled" }),
      makeSubscription({ name: "Roczna", amountCents: 29900, billingCycle: "yearly", category: "software" }),
    ]);
    expect(list.map((i) => i.subscription.name)).toEqual(["Siłownia", "Netflix", "Roczna"]);
  });
});

describe("findOverlaps", () => {
  it("finds two clouds, music services and the same plan twice", () => {
    const overlaps = findOverlaps([
      makeSubscription({ name: "iCloud+", category: "cloud" }),
      makeSubscription({ name: "Google One", category: "cloud" }),
      makeSubscription({ name: "Spotify Premium", category: "music" }),
      makeSubscription({ name: "YouTube Premium", category: "video" }),
      makeSubscription({ name: "Netflix" }),
      makeSubscription({ name: "netflix " }),
      makeSubscription({ name: "Disney+" }),
    ]);
    expect(overlaps.map((o) => o.kind).sort()).toEqual(["cloud", "music", "same"]);
    expect(overlapTitle(overlaps.find((o) => o.kind === "same")!)).toBe("Netflix masz 2 razy");
  });

  it("ignores app store charges, bills and cancelled plans", () => {
    expect(
      findOverlaps([
        makeSubscription({ name: "App Store (Apple)", category: "software" }),
        makeSubscription({ name: "App Store (Apple)", category: "software" }),
        makeSubscription({ name: "Ubezpieczenie (Warta)", category: "insurance" }),
        makeSubscription({ name: "Ubezpieczenie (Warta)", category: "insurance" }),
        makeSubscription({ name: "Spotify" }),
        makeSubscription({ name: "Tidal", status: "cancelled" }),
      ]),
    ).toEqual([]);
  });

  it("keeps the same key for the same plans", () => {
    const a = makeSubscription({ name: "Dropbox" });
    const b = makeSubscription({ name: "OneDrive" });
    expect(findOverlaps([a, b])[0].key).toBe(findOverlaps([b, a])[0].key);
  });
});

describe("cancelGuideSlug", () => {
  it("links names to existing guides", () => {
    for (const name of ["Netflix", "Spotify Premium", "Apple Music", "App Store (Apple)", "Disney+", "HBO Max", "CANAL+", "Player"]) {
      const slug = cancelGuideSlug(name);
      expect(slug && getCancelGuide(slug), name).toBeTruthy();
    }
    expect(cancelGuideSlug("Apple Music")).toBe("apple-music");
    expect(cancelGuideSlug("Siłownia")).toBeNull();
  });
});
