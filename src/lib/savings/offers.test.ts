import { describe, expect, it } from "vitest";
import { makeSubscription } from "@/lib/subscriptions/fixtures";
import { buildNoticeLetter } from "./notice-letter";
import { cheaperOffers, isCarInsurance } from "./offers";

describe("cheaperOffers", () => {
  it("matches the listed monthly price only", () => {
    const tips = cheaperOffers([
      makeSubscription({ name: "Disney+", amountCents: 5999 }),
      makeSubscription({ name: "Disney+", amountCents: 3799 }),
      makeSubscription({ name: "Spotify Premium", amountCents: 2699 }),
      makeSubscription({ name: "Disney+", amountCents: 5999, billingCycle: "yearly" }),
    ]);
    expect(tips.map((t) => t.offer.id)).toEqual(["disney-premium-yearly", "spotify-individual-shared"]);
    expect(tips[0].offer.yearlySavingCents).toBe(11998);
  });
});

describe("isCarInsurance", () => {
  it("recognises OC", () => {
    expect(isCarInsurance(makeSubscription({ name: "OC samochodu" }))).toBe(true);
    expect(isCarInsurance(makeSubscription({ name: "Ubezpieczenie samochodu (Warta)" }))).toBe(true);
    expect(isCarInsurance(makeSubscription({ name: "Ubezpieczenie na życie (Warta)" }))).toBe(false);
    expect(isCarInsurance(makeSubscription({ name: "Disco Club" }))).toBe(false);
  });
});

describe("buildNoticeLetter", () => {
  const base = { city: "Kraków", date: "20.10.2026", fullName: "Jan Kowalski", address: "ul. Długa 1", company: "Siłownia X", service: "karnet", contractNumber: "", vehicle: "", policyEnd: "" };
  it("writes a general notice with placeholders for missing data", () => {
    const text = buildNoticeLetter({ ...base, kind: "general" });
    expect(text).toContain("Niniejszym wypowiadam umowę dotyczącą usługi karnet, z zachowaniem");
    expect(buildNoticeLetter({ ...base, kind: "general", fullName: "" })).toContain("[imię i nazwisko]");
  });
  it("cites the OC law", () => {
    expect(buildNoticeLetter({ ...base, kind: "oc", contractNumber: "123" })).toContain("art. 28 ust. 1 ustawy z dnia 22 maja 2003 r.");
  });
});
