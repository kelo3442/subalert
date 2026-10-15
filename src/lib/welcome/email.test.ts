import { describe, expect, it } from "vitest";
import { buildWelcomeEmail } from "./email";

describe("welcome e-mail", () => {
  const email = buildWelcomeEmail("https://www.oplacik.pl");

  it("links each step to the right page", () => {
    for (const path of ["/panel/start", "/panel/ustawienia#aplikacja", "/panel/ustawienia#kalendarz"]) {
      expect(email.html).toContain(`href="https://www.oplacik.pl${path}"`);
      expect(email.text).toContain(`https://www.oplacik.pl${path}`);
    }
  });

  it("has a subject and a plain-text version with all steps", () => {
    expect(email.subject).toBe("Witaj w Opłaciku: 3 kroki na dobry start");
    expect(email.text).toMatch(/1\. Dodaj swoje stałe opłaty[\s\S]*2\. Włącz powiadomienia[\s\S]*3\. Dodaj terminy do kalendarza/);
  });
});
