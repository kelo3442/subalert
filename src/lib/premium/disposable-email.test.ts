import { describe, expect, it } from "vitest";
import { isDisposableEmail } from "./disposable-email";

describe("isDisposableEmail", () => {
  it("flags well-known throwaway services, including subdomains and odd casing", () => {
    expect(isDisposableEmail("abc@yopmail.com")).toBe(true);
    expect(isDisposableEmail("ABC@Mailinator.com ")).toBe(true);
    expect(isDisposableEmail("x@inbox.guerrillamail.com")).toBe(true);
  });

  it("accepts normal providers", () => {
    for (const email of ["jan@gmail.com", "ola@wp.pl", "a@o2.pl", "b@icloud.com", "c@onet.pl", "d@interia.pl", "e@firma.com.pl"]) {
      expect(isDisposableEmail(email)).toBe(false);
    }
  });

  it("does not match a lookalike domain", () => {
    expect(isDisposableEmail("x@notyopmail.com")).toBe(false);
    expect(isDisposableEmail("")).toBe(false);
  });
});
