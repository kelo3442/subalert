import { describe, expect, it } from "vitest";
import { deleteAccountSchema, forgotPasswordSchema, loginSchema, newPasswordSchema, registerSchema } from "./auth";
import { reminderSettingsSchema } from "./settings";
import { parseBulkSubscriptions, subscriptionInputFromFormData, subscriptionSchema } from "./subscription";

function form(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

const valid = {
  name: "  Netflix ",
  amount: "49,00",
  billingCycle: "monthly",
  nextPaymentDate: "2026-10-20",
  status: "active",
};

describe("subscriptionSchema", () => {
  it("parses a minimal subscription", () => {
    const result = subscriptionSchema.parse(subscriptionInputFromFormData(form(valid)));
    expect(result).toEqual({
      name: "Netflix",
      amountCents: 4900,
      amountIsEstimate: false,
      billingCycle: "monthly",
      nextPaymentDate: "2026-10-20",
      status: "active",
      trialEndsAt: null,
      category: null,
      manageUrl: null,
      notes: null,
    });
  });

  it("keeps optional fields and trial dates", () => {
    const result = subscriptionSchema.parse(
      subscriptionInputFromFormData(
        form({
          ...valid,
          hasTrial: "on",
          trialEndsAt: "2026-10-19",
          category: "video",
          manageUrl: "https://www.netflix.com/account",
          notes: "Plan rodzinny",
        }),
      ),
    );
    expect(result).toMatchObject({
      trialEndsAt: "2026-10-19",
      category: "video",
      manageUrl: "https://www.netflix.com/account",
      notes: "Plan rodzinny",
    });
  });

  it("accepts bills: bimonthly cycle, utility category and estimated amount", () => {
    const result = subscriptionSchema.parse(
      subscriptionInputFromFormData(
        form({ ...valid, name: "Prąd", billingCycle: "bimonthly", category: "utilities", amountIsEstimate: "on" }),
      ),
    );
    expect(result).toMatchObject({ billingCycle: "bimonthly", category: "utilities", amountIsEstimate: true });
  });

  it("drops the trial date when the trial box is unchecked", () => {
    const result = subscriptionSchema.parse(
      subscriptionInputFromFormData(form({ ...valid, trialEndsAt: "2026-10-19" })),
    );
    expect(result.trialEndsAt).toBeNull();
  });

  it.each([
    [{ name: "" }, "name"],
    [{ name: "x".repeat(81) }, "name"],
    [{ amount: "" }, "amount"],
    [{ amount: "abc" }, "amount"],
    [{ amount: "0" }, "amount"],
    [{ amount: "100000,01" }, "amount"],
    [{ billingCycle: "daily" }, "billingCycle"],
    [{ nextPaymentDate: "2026-02-30" }, "nextPaymentDate"],
    [{ nextPaymentDate: "" }, "nextPaymentDate"],
    [{ hasTrial: "on" }, "trialEndsAt"],
    [{ category: "crypto" }, "category"],
    [{ manageUrl: "javascript:alert(1)" }, "manageUrl"],
    [{ manageUrl: "netflix.com" }, "manageUrl"],
    [{ status: "paused" }, "status"],
  ])("rejects %o", (override, field) => {
    const result = subscriptionSchema.safeParse(subscriptionInputFromFormData(form({ ...valid, ...override })));
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toContain(field);
  });
});

describe("auth schemas", () => {
  it("validates login", () => {
    expect(loginSchema.safeParse({ email: "jan@example.pl", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "jan", password: "x" }).success).toBe(false);
  });

  it("requires matching, long enough passwords on sign-up", () => {
    expect(
      registerSchema.safeParse({ email: "jan@example.pl", password: "dobrehaslo", passwordConfirm: "dobrehaslo", acceptTerms: true })
        .success,
    ).toBe(true);
    expect(
      registerSchema.safeParse({ email: "jan@example.pl", password: "dobrehaslo", passwordConfirm: "dobrehaslo", acceptTerms: false })
        .error?.issues[0].path,
    ).toEqual(["acceptTerms"]);
    expect(
      registerSchema.safeParse({ email: "jan@example.pl", password: "krotkie", passwordConfirm: "krotkie", acceptTerms: true }).success,
    ).toBe(false);
    const mismatch = registerSchema.safeParse({
      email: "jan@example.pl",
      password: "dobrehaslo",
      passwordConfirm: "innehaslo",
      acceptTerms: true,
    });
    expect(mismatch.error?.issues[0].path).toEqual(["passwordConfirm"]);
  });
});

describe("password and account schemas", () => {
  it("validates the forgot-password e-mail", () => {
    expect(forgotPasswordSchema.safeParse({ email: " jan@example.pl " }).data).toEqual({ email: "jan@example.pl" });
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });

  it("requires a strong, confirmed new password", () => {
    expect(newPasswordSchema.safeParse({ password: "noweHaslo1", passwordConfirm: "noweHaslo1" }).success).toBe(true);
    expect(newPasswordSchema.safeParse({ password: "krotkie", passwordConfirm: "krotkie" }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ password: "noweHaslo1", passwordConfirm: "inne" }).error?.issues[0].path).toEqual([
      "passwordConfirm",
    ]);
  });

  it("requires typing the confirmation word to delete the account", () => {
    expect(deleteAccountSchema.safeParse({ confirmation: "USUŃ" }).success).toBe(true);
    expect(deleteAccountSchema.safeParse({ confirmation: " usuń " }).success).toBe(true);
    expect(deleteAccountSchema.safeParse({ confirmation: "tak" }).success).toBe(false);
  });
});

describe("reminderSettingsSchema", () => {
  it("accepts valid settings", () => {
    expect(
      reminderSettingsSchema.parse({ remindersEnabled: true, daysBefore: "3", timeZone: "Europe/Warsaw" }),
    ).toEqual({ remindersEnabled: true, daysBefore: 3, timeZone: "Europe/Warsaw" });
  });

  it("rejects bad values", () => {
    expect(reminderSettingsSchema.safeParse({ remindersEnabled: true, daysBefore: "30", timeZone: "Europe/Warsaw" }).success).toBe(false);
    expect(reminderSettingsSchema.safeParse({ remindersEnabled: true, daysBefore: "3", timeZone: "Mars/Base" }).success).toBe(false);
  });
});

describe("parseBulkSubscriptions", () => {
  const item = { name: "Netflix", amount: "49", billingCycle: "monthly", nextPaymentDate: "2026-10-20", category: "video" };

  it("accepts a valid list", () => {
    const result = parseBulkSubscriptions(JSON.stringify([item, { ...item, name: "Własna", category: "" }]));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.values).toHaveLength(2);
      expect(result.values[0]).toMatchObject({ name: "Netflix", amountCents: 4900, status: "active", trialEndsAt: null });
      expect(result.values[1].category).toBeNull();
    }
  });

  it("reports errors per item", () => {
    const result = parseBulkSubscriptions(
      JSON.stringify([item, { ...item, amount: "" }, { ...item, name: "", nextPaymentDate: "2026-02-30" }]),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.itemErrors)).toEqual(["1", "2"]);
      expect(result.itemErrors[1].amount).toBe("Podaj kwotę.");
      expect(result.itemErrors[2].name).toBe("Podaj nazwę usługi.");
      expect(result.itemErrors[2].nextPaymentDate).toBe("Podaj poprawną datę.");
    }
  });

  it("rejects malformed, empty and oversized payloads", () => {
    expect(parseBulkSubscriptions("not json").ok).toBe(false);
    expect(parseBulkSubscriptions("[]").ok).toBe(false);
    expect(parseBulkSubscriptions(JSON.stringify(Array(41).fill(item))).ok).toBe(false);
    expect(parseBulkSubscriptions(JSON.stringify([{ name: 1 }])).ok).toBe(false);
  });

  it("cannot smuggle in other fields such as status or user_id", () => {
    const result = parseBulkSubscriptions(JSON.stringify([{ ...item, status: "cancelled", user_id: "x" }]));
    expect(result.ok && result.values[0].status).toBe("active");
    expect(result.ok && "user_id" in result.values[0]).toBe(false);
  });
});
