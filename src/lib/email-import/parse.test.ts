import { describe, expect, it } from "vitest";
import {
  daysToNearestPayment,
  decideAction,
  detectCycle,
  detectEvent,
  extractInboundToken,
  findDate,
  findPlnAmount,
  findTracked,
  findTrialEnd,
  parseReceiptEmail,
  planUpdate,
  senderName,
  type InboundEmail,
} from "./parse";

const receivedAt = new Date("2026-10-12T09:00:00Z");
const email = (overrides: Partial<InboundEmail>): InboundEmail => ({
  from: "",
  subject: "",
  text: "",
  html: "",
  receivedAt,
  ...overrides,
});
const TOKEN = "0123456789abcdef0123456789abcdef";

describe("helpers", () => {
  it("reads the sender name", () => {
    expect(senderName("Netflix <info@account.netflix.com>")).toBe("Netflix");
    expect(senderName('"Mój Klub Fitness" <kontakt@klub.pl>')).toBe("Mój Klub Fitness");
    expect(senderName("billing@cityfit.pl")).toBe("Cityfit");
  });

  it("finds PLN amounts, preferring totals", () => {
    expect(findPlnAmount("Plan Premium\nCena: 29,99 zł\nRazem do zapłaty: 49,00 zł")).toBe(4900);
    expect(findPlnAmount("Kwota: PLN 1 299,00")).toBe(129900);
    expect(findPlnAmount("Total: 99 PLN")).toBe(9900);
    expect(findPlnAmount("Total: $20.00")).toBeNull();
  });

  it("detects the billing cycle", () => {
    expect(detectCycle("Twój plan roczny został odnowiony")).toBe("yearly");
    expect(detectCycle("Annual subscription")).toBe("yearly");
    expect(detectCycle("Płatność miesięczna")).toBe("monthly");
  });

  it("parses dates in Polish and English formats", () => {
    expect(findDate("kończy się 20 października 2026.")).toBe("2026-10-20");
    expect(findDate("ends on October 20, 2026")).toBe("2026-10-20");
    expect(findDate("do 20.10.2026 r.")).toBe("2026-10-20");
    expect(findDate("brak daty")).toBeNull();
  });
});

describe("parseReceiptEmail", () => {
  it("recognises a known service receipt in Polish", () => {
    const parsed = parseReceiptEmail(
      email({
        from: "Netflix <info@account.netflix.com>",
        subject: "Twoja płatność za Netflix",
        text: "Dziękujemy! Pobraliśmy opłatę za członkostwo.\nKwota: 49,00 zł\nPlan: Standard",
      }),
      "Europe/Warsaw",
    );
    expect(parsed).toEqual({
      kind: "subscription",
      event: "receipt",
      name: "Netflix",
      knownService: true,
      amountCents: 4900,
      cycle: "monthly",
      nextPaymentDate: "2026-11-12",
      trialEndsAt: null,
      category: "video",
      manageUrl: "https://www.netflix.com/account",
    });
  });

  it("handles HTML-only English receipts", () => {
    const parsed = parseReceiptEmail(
      email({
        from: "OpenAI <noreply@tm.openai.com>",
        subject: "Your ChatGPT Plus receipt",
        html: "<table><tr><td>ChatGPT Plus Subscription</td></tr><tr><td>Total</td><td>PLN&nbsp;99.00</td></tr></table>",
      }),
      "Europe/Warsaw",
    );
    expect(parsed).toMatchObject({ name: "ChatGPT Plus", amountCents: 9900, knownService: true });
  });

  it("uses the trial end as the first payment date", () => {
    const parsed = parseReceiptEmail(
      email({
        from: "Spotify <no-reply@spotify.com>",
        subject: "Witamy w Premium",
        text: "Twój bezpłatny okres próbny kończy się 20 października 2026. Potem 23,99 zł miesięcznie.",
      }),
      "Europe/Warsaw",
    );
    expect(parsed).toMatchObject({ trialEndsAt: "2026-10-20", nextPaymentDate: "2026-10-20", amountCents: 2399 });
  });

  it("reads the original sender of a manually forwarded e-mail", () => {
    const parsed = parseReceiptEmail(
      email({
        from: "Jan Kowalski <jan@gmail.com>",
        subject: "Fwd: Potwierdzenie płatności",
        text: "---------- Forwarded message ---------\nFrom: Klub Fitness Żyrafa <platnosci@zyrafa.pl>\nSubject: Potwierdzenie płatności\n\nKarnet miesięczny\nRazem: 139,00 zł",
      }),
      "Europe/Warsaw",
    );
    expect(parsed).toMatchObject({ name: "Klub Fitness Żyrafa", knownService: false, amountCents: 13900 });
  });

  it("extracts the Gmail forwarding confirmation code and link", () => {
    expect(
      parseReceiptEmail(
        email({
          from: "Gmail Team <forwarding-noreply@google.com>",
          subject: "(#123456789) Gmail Forwarding Confirmation - Receive Mail from jan@gmail.com",
          text: "To allow forwarding, click https://mail-settings.google.com/mail/vf-%5BABC%5D-xyz123 \nConfirmation code: 123456789",
        }),
        "Europe/Warsaw",
      ),
    ).toEqual({ kind: "gmail_verification", code: "123456789", link: "https://mail-settings.google.com/mail/vf-%5BABC%5D-xyz123" });
  });

  it("ignores unrelated e-mails", () => {
    expect(
      parseReceiptEmail(email({ from: "Ciocia <ciocia@wp.pl>", subject: "Obiad w niedzielę?", text: "Przyjdziecie?" }), "Europe/Warsaw"),
    ).toEqual({ kind: "ignored" });
  });
});

describe("decideAction", () => {
  const base = {
    kind: "subscription" as const,
    event: "receipt" as const,
    name: "Netflix",
    knownService: true,
    amountCents: 4900,
    cycle: "monthly" as const,
    nextPaymentDate: "2026-11-12",
    trialEndsAt: null,
    category: "video" as const,
    manageUrl: null,
  };

  it("auto-adds complete known services", () => {
    expect(decideAction(base, { autoAdd: true, existingNames: [] })).toBe("auto_add");
  });

  it("asks for review when auto-add is off, the service is unknown or data is missing", () => {
    expect(decideAction(base, { autoAdd: false, existingNames: [] })).toBe("suggest");
    expect(decideAction({ ...base, knownService: false }, { autoAdd: true, existingNames: [] })).toBe("suggest");
    expect(decideAction({ ...base, amountCents: null }, { autoAdd: true, existingNames: [] })).toBe("suggest");
  });

  it("skips services the user already has", () => {
    expect(decideAction(base, { autoAdd: true, existingNames: [" netflix "] })).toBe("duplicate");
  });
});

describe("extractInboundToken", () => {
  it("reads the token from the address or plus tag", () => {
    expect(extractInboundToken([`${TOKEN}@in.subalert.pl`])).toBe(TOKEN);
    expect(extractInboundToken([`Jan <${TOKEN}@in.subalert.pl>`])).toBe(TOKEN);
    expect(extractInboundToken([`abc123+${TOKEN}@inbound.postmarkapp.com`])).toBe(TOKEN);
    expect(extractInboundToken([TOKEN.toUpperCase()])).toBe(TOKEN);
  });

  it("rejects anything else", () => {
    expect(extractInboundToken(["kontakt@subalert.pl", "abc@in.subalert.pl"])).toBeNull();
  });
});

describe("trial end", () => {
  it("reads numeric dates inside the trial sentence", () => {
    expect(findTrialEnd("Witamy! Twój bezpłatny okres próbny kończy się 30.10.2026. Potem 23,99 zł.")).toEqual({ isTrial: true, endsAt: "2026-10-30" });
    expect(findTrialEnd("Your free trial ends on October 30, 2026.\nThanks")).toEqual({ isTrial: true, endsAt: "2026-10-30" });
  });
});

describe("e-mail events", () => {
  it("classifies cancellations, price changes, trials and receipts", () => {
    expect(detectEvent("Twoja subskrypcja została anulowana", "", false)).toBe("cancellation");
    expect(detectEvent("Potwierdzenie anulowania członkostwa", "", false)).toBe("cancellation");
    expect(detectEvent("Your Spotify Premium subscription has been cancelled", "", false)).toBe("cancellation");
    expect(detectEvent("We're sorry to see you go", "Your membership ends on 20 October", false)).toBe("cancellation");
    expect(detectEvent("Zmiana ceny Twojego planu", "Od 20 listopada cena wzrośnie do 55 zł", false)).toBe("price_change");
    expect(detectEvent("Important: your price is changing", "", false)).toBe("price_change");
    expect(detectEvent("Witamy w Premium", "Okres próbny kończy się 30.10.2026", true)).toBe("trial");
    expect(detectEvent("Dziękujemy za płatność", "Kwota: 49,00 zł", false)).toBe("receipt");
    expect(detectEvent("Twój plan został odnowiony", "Kwota: 49,00 zł", false)).toBe("receipt");
  });
});

describe("planUpdate", () => {
  const tracked = {
    id: "sub-1",
    name: "Netflix",
    amountCents: 4900,
    billingCycle: "monthly" as const,
    nextPaymentDate: "2026-10-20",
    trialEndsAt: null,
  };
  const parsed = (event: "receipt" | "trial" | "cancellation" | "price_change", extra = {}) => ({
    kind: "subscription" as const,
    event,
    name: "Netflix",
    knownService: true,
    amountCents: 4900,
    cycle: "monthly" as const,
    nextPaymentDate: null,
    trialEndsAt: null,
    category: "video" as const,
    manageUrl: null,
    ...extra,
  });
  const now = new Date("2026-10-20T10:00:00Z");

  it("measures the distance to the nearest charge on either side of the stored date", () => {
    expect(daysToNearestPayment("2026-10-20", "monthly", "2026-10-20")).toBe(0);
    expect(daysToNearestPayment("2026-11-20", "monthly", "2026-10-22")).toBe(2);
    expect(daysToNearestPayment("2025-01-20", "monthly", "2026-10-18")).toBe(2);
    expect(daysToNearestPayment("2026-10-20", "monthly", "2026-11-05")).toBe(15);
  });

  it("ignores a receipt that matches the schedule and amount", () => {
    expect(planUpdate(parsed("receipt"), tracked, "2026-10-20", now)).toBeNull();
  });

  it("detects a price rise on a receipt", () => {
    expect(planUpdate(parsed("receipt", { amountCents: 5500 }), tracked, "2026-10-20", now)).toEqual({
      change: "price",
      patch: { amount_cents: 5500 },
      previousAmountCents: 4900,
    });
  });

  it("moves the schedule to the real charge day", () => {
    expect(planUpdate(parsed("receipt"), { ...tracked, nextPaymentDate: "2026-11-15" }, "2026-10-20", now)).toEqual({
      change: "payment",
      patch: { next_payment_date: "2026-11-20" },
      previousAmountCents: null,
    });
    // Uses the tracked cycle even when the e-mail does not say "yearly".
    expect(planUpdate(parsed("receipt"), { ...tracked, billingCycle: "yearly", nextPaymentDate: "2026-10-18" }, "2026-10-20", now)?.patch).toEqual({
      next_payment_date: "2027-10-20",
    });
  });

  it("does not let stray e-mails shift the schedule or price", () => {
    expect(planUpdate(parsed("receipt", { amountCents: 5500 }), tracked, "2026-11-05", now)).toBeNull();
    expect(planUpdate(parsed("receipt", { amountCents: 100 }), tracked, "2026-10-20", now)).toBeNull();
    expect(planUpdate(parsed("receipt", { amountCents: 99_900 }), tracked, "2026-10-20", now)).toBeNull();
    expect(planUpdate(parsed("price_change", { amountCents: null }), tracked, "2026-10-20", now)).toBeNull();
  });

  it("applies announced price changes, trials and cancellations", () => {
    expect(planUpdate(parsed("price_change", { amountCents: 5500 }), tracked, "2026-11-05", now)?.patch).toEqual({ amount_cents: 5500 });
    expect(planUpdate(parsed("trial", { trialEndsAt: "2026-11-03" }), tracked, "2026-10-20", now)).toEqual({
      change: "trial",
      patch: { trial_ends_at: "2026-11-03", next_payment_date: "2026-11-03" },
      previousAmountCents: null,
    });
    expect(planUpdate(parsed("trial", { trialEndsAt: "2026-10-01" }), tracked, "2026-10-20", now)).toBeNull();
    expect(planUpdate(parsed("cancellation"), tracked, "2026-10-20", now)).toEqual({
      change: "cancelled",
      patch: { status: "cancelled", cancelled_at: "2026-10-20T10:00:00.000Z" },
      previousAmountCents: null,
    });
  });

  it("finds the tracked subscription by name, ignoring case", () => {
    expect(findTracked("netflix ", [tracked])?.id).toBe("sub-1");
    expect(findTracked("Spotify", [tracked])).toBeNull();
  });
});
