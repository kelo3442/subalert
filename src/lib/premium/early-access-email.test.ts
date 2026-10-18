import { describe, expect, it } from "vitest";
import { buildEarlyAccessEmail } from "./early-access-email";

describe("early access e-mail", () => {
  it("links to the claim page and says how many places are left", () => {
    const url = "https://www.oplacik.pl/premium/odbierz?t=abc&x=<1>";
    const email = buildEarlyAccessEmail(url, 42);
    expect(email.subject).toBe("Odbierz darmowe Premium w Opłaciku");
    expect(email.html).toContain('href="https://www.oplacik.pl/premium/odbierz?t=abc&amp;x=&lt;1&gt;"');
    expect(email.text).toContain(`Odbierz darmowe Premium: ${url}`);
    expect(email.text).toContain("Zostało jeszcze 42 z 100 miejsc.");
  });
});
