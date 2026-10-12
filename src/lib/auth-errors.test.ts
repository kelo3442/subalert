import { describe, expect, it } from "vitest";
import { authErrorMessage, GENERIC_AUTH_ERROR } from "./auth-errors";

describe("authErrorMessage", () => {
  it("translates known codes", () => {
    expect(authErrorMessage({ code: "invalid_credentials" })).toBe("Nieprawidłowy e-mail lub hasło.");
    expect(authErrorMessage({ status: 429 })).toMatch(/Zbyt wiele prób/);
  });

  it("never leaks raw provider messages", () => {
    expect(authErrorMessage({ code: "unexpected_failure" })).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage(null)).toBe(GENERIC_AUTH_ERROR);
  });
});
