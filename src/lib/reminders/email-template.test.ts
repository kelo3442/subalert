import { describe, expect, it } from "vitest";
import { buildReminderEmail } from "./email-template";

const base = {
  subscriptionName: "Netflix",
  amountCents: 4900,
  eventDate: "2026-10-15",
  today: "2026-10-12",
  manageUrl: "https://www.netflix.com/account",
  appUrl: "https://oplacik.example",
  subscriptionId: "abc",
};

describe("buildReminderEmail", () => {
  it("describes upcoming payments", () => {
    const email = buildReminderEmail({ ...base, kind: "payment" });
    expect(email.subject.replace(/\s/g, " ")).toBe("Płatność za Netflix za 3 dni: 49,00 zł");
    expect(email.text).toContain("nie anuluje subskrypcji automatycznie");
    expect(email.text).toContain("https://oplacik.example/panel/subskrypcje/abc");
  });

  it("describes trial ends", () => {
    const email = buildReminderEmail({ ...base, kind: "trial_end", eventDate: "2026-10-13" });
    expect(email.subject).toBe("Okres próbny Netflix kończy się jutro");
  });

  it("escapes user-provided names in HTML", () => {
    const email = buildReminderEmail({ ...base, kind: "payment", subscriptionName: '<img src=x onerror="x">' });
    expect(email.html).not.toContain("<img");
    expect(email.html).toContain("&lt;img");
  });
});
