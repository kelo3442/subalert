import { describe, expect, it } from "vitest";
import { detectRecurring, merchantKey } from "./recurring";
import type { Transaction } from "./statement";

const today = "2026-10-12";
const t = (date: string, amountCents: number, description: string): Transaction => ({ date, amountCents, description });

describe("merchantKey", () => {
  it("ignores card numbers, dates and payment noise", () => {
    expect(merchantKey("Płatność kartą 05.10 CITYFIT WARSZAWA nr karty 4567")).toBe(merchantKey("PLATNOSC KARTA 05.09 CITYFIT WARSZAWA nr 4567"));
    expect(merchantKey("Płatność kartą 05.10 CITYFIT WARSZAWA")).toBe("cityfit warszawa");
  });
});

describe("detectRecurring", () => {
  const history: Transaction[] = [
    // monthly known service, price change on the latest charge
    t("2026-07-05", 4300, "NETFLIX.COM AMSTERDAM"),
    t("2026-08-05", 4300, "NETFLIX.COM AMSTERDAM"),
    t("2026-09-05", 4900, "NETFLIX.COM AMSTERDAM"),
    t("2026-10-05", 4900, "NETFLIX.COM AMSTERDAM"),
    // monthly unknown merchant with different description noise
    t("2026-08-01", 12900, "Płatność kartą 01.08 CITYFIT WARSZAWA"),
    t("2026-09-01", 12900, "Płatność kartą 01.09 CITYFIT WARSZAWA"),
    t("2026-10-01", 12900, "Płatność kartą 01.10 CITYFIT WARSZAWA"),
    // weekly
    t("2026-09-21", 1000, "VPN SERVICE subscription"),
    t("2026-09-28", 1000, "VPN SERVICE subscription"),
    t("2026-10-05", 1000, "VPN SERVICE subscription"),
    // groceries: irregular amounts and gaps
    t("2026-09-02", 8734, "BIEDRONKA 123"),
    t("2026-09-04", 2311, "BIEDRONKA 123"),
    t("2026-09-19", 15020, "BIEDRONKA 123"),
    t("2026-10-08", 4410, "BIEDRONKA 123"),
    // one-off
    t("2026-09-15", 19900, "MEDIA EXPERT"),
    // stopped paying: monthly until June
    t("2026-04-10", 2999, "DISNEY PLUS"),
    t("2026-05-10", 2999, "DISNEY PLUS"),
    t("2026-06-10", 2999, "DISNEY PLUS"),
    // yearly
    t("2025-03-20", 24900, "DOMENA HOSTING SP ZOO abonament roczny"),
    t("2026-03-20", 26900, "DOMENA HOSTING SP ZOO abonament roczny"),
    // the same bakery every month is still not a subscription
    t("2026-08-14", 1850, "Płatność kartą PIEKARNIA U JANA"),
    t("2026-09-14", 1850, "Płatność kartą PIEKARNIA U JANA"),
    t("2026-10-14", 1850, "Płatność kartą PIEKARNIA U JANA"),
    // a local gym is recognised by the word "siłownia"
    t("2026-08-20", 13900, "Płatność kartą SIŁOWNIA ŻYRAFA KRAKÓW"),
    t("2026-09-20", 13900, "Płatność kartą SIŁOWNIA ŻYRAFA KRAKÓW"),
    t("2026-10-20", 13900, "Płatność kartą SIŁOWNIA ŻYRAFA KRAKÓW"),
  ];

  const result = detectRecurring(history, today);
  const byName = Object.fromEntries(result.map((c) => [c.name, c]));

  it("finds subscriptions and ignores shopping, even when it repeats", () => {
    expect(Object.keys(byName).sort()).toEqual(["Disney+", "Domena Hosting", "Netflix", "Siłownia / karta sportowa", "Siłownia Żyrafa Kraków", "Vpn Service"]);
  });

  it("recognises known services and uses the latest price", () => {
    expect(byName.Netflix).toMatchObject({
      knownService: true,
      category: "video",
      manageUrl: "https://www.netflix.com/account",
      amountCents: 4900,
      cycle: "monthly",
      occurrences: 4,
      nextPaymentDate: "2026-11-05",
      possiblyInactive: false,
    });
  });

  it("detects cycles", () => {
    expect(byName["Siłownia / karta sportowa"]).toMatchObject({ cycle: "monthly", nextPaymentDate: "2026-11-01", knownService: true });
    expect(byName["Vpn Service"]).toMatchObject({ cycle: "weekly", nextPaymentDate: "2026-10-12" });
    expect(byName["Domena Hosting"]).toMatchObject({ cycle: "yearly", amountCents: 26900, nextPaymentDate: "2027-03-20" });
  });

  it("flags subscriptions that seem to have stopped", () => {
    expect(byName["Disney+"].possiblyInactive).toBe(true);
    expect(result.at(-1)?.name).toBe("Disney+");
  });

  it("detects bimonthly electricity bills with varying amounts", () => {
    const bills = [
      t("2026-02-10", 21_000, "TAURON SPRZEDAŻ prognoza"),
      t("2026-04-10", 19_500, "TAURON SPRZEDAŻ prognoza"),
      t("2026-06-10", 17_800, "TAURON SPRZEDAŻ prognoza"),
      t("2026-08-10", 18_900, "TAURON SPRZEDAŻ prognoza"),
    ];
    expect(detectRecurring(bills, today)).toEqual([
      expect.objectContaining({ name: "Prąd", category: "utilities", cycle: "bimonthly", nextPaymentDate: "2026-12-10" }),
    ]);
  });

  it("needs two charges for merchants it does not know", () => {
    expect(detectRecurring([t("2026-10-05", 12900, "KLUB JOGI OM abonament")], today)).toEqual([]);
  });

  it("suggests known services after a single charge and assumes a monthly cycle", () => {
    const found = detectRecurring(
      [
        t("2026-10-05", 8900, "ANTHROPIC* CLAUDE SUB +14152360599"),
        t("2026-08-08", 99, "APPLE.COM/BILL APPLE.COM/BIL IRL"),
        t("2026-08-08", 99, "APPLE.COM/BILL APPLE.COM/BIL IRL"),
        t("2026-10-01", 1650, "ZABKA Z9781 KATOWICE"),
      ],
      today,
    );
    expect(found.map((c) => [c.name, c.amountCents, c.cycle, c.singleCharge, c.possiblyInactive, c.nextPaymentDate])).toEqual([
      ["Claude Pro", 8900, "monthly", true, false, "2026-11-05"],
      ["App Store (Apple)", 99, "monthly", true, true, "2026-11-08"],
    ]);
  });

  it("splits App Store and Google Play charges by price and explains that the app is not named", () => {
    const found = detectRecurring(
      [
        t("2026-08-10", 5999, "APPLE.COM/BILL APPLE.COM/BIL IRL"),
        t("2026-09-10", 5999, "APPLE.COM/BILL APPLE.COM/BIL IRL"),
        t("2026-10-10", 5999, "APPLE.COM/BILL APPLE.COM/BIL IRL"),
        t("2026-10-03", 499, "APPLE.COM/BILL APPLE.COM/BIL IRL"),
        t("2026-10-07", 2499, "GOOGLE *Duet Display g.co/helppay#"),
      ],
      today,
    );
    expect(found.map((c) => [c.name, c.amountCents, c.cycle, c.singleCharge])).toEqual([
      ["App Store (Apple)", 5999, "monthly", false],
      ["Google Play", 2499, "monthly", true],
      ["App Store (Apple)", 499, "monthly", true],
    ]);
    expect(found[0].note).toMatch(/dowolna aplikacja kupiona na iPhonie/);
    expect(found[1].note).toMatch(/Google Play/);
  });

  it("does not take Apple Pay or Google Pay for the merchant", () => {
    const found = detectRecurring(
      [
        t("2026-09-05", 12900, "Płatność kartą Apple Pay CITYFIT WARSZAWA abonament"),
        t("2026-10-05", 12900, "Płatność kartą Apple Pay CITYFIT WARSZAWA abonament"),
        t("2026-10-08", 4500, "Płatność Google Pay ZABKA Z9781"),
        t("2026-09-08", 4500, "Płatność Google Pay ZABKA Z9781"),
      ],
      today,
    );
    expect(found.map((c) => c.name)).toEqual(["Siłownia / karta sportowa"]);
  });

  it("tells life, car and home insurance apart and names the insurer", () => {
    const names = (description: string) => detectRecurring([t("2026-10-02", 6000, description)], today).map((c) => [c.name, c.category]);
    expect(names("TUnŻ WARTA S.A. składka ubezpieczenie na życie polisa 123")).toEqual([["Ubezpieczenie na życie (Warta)", "insurance"]]);
    expect(names("WARTA SA polisa OC/AC WX12345")).toEqual([["Ubezpieczenie samochodu (Warta)", "insurance"]]);
    expect(names("PZU SA ubezpieczenie mieszkania")).toEqual([["Ubezpieczenie mieszkania (PZU)", "insurance"]]);
    expect(names("WARTA SA polisa 99887766")).toEqual([["Ubezpieczenie (Warta)", "insurance"]]);
    expect(names("Autoryzacja karty WARTA SA składka na życie")).toEqual([["Ubezpieczenie na życie (Warta)", "insurance"]]);
  });
});
