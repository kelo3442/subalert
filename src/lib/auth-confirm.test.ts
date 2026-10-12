import { describe, expect, it } from "vitest";
import { confirmFailureNotice, PASSWORD_PAGE } from "./auth-confirm";

describe("confirmFailureNotice", () => {
  it("reports expired or invalid links", () => {
    expect(confirmFailureNotice({ hadCode: false, errorCode: "otp_expired", next: "/panel" })).toBe("link");
    expect(confirmFailureNotice({ hadCode: false, errorCode: null, next: "/panel" })).toBe("link");
  });

  it("treats a failed code exchange after sign-up as a confirmed address", () => {
    expect(confirmFailureNotice({ hadCode: true, errorCode: null, next: "/panel" })).toBe("potwierdzono");
  });

  it("asks to reopen password reset links in the original browser", () => {
    expect(confirmFailureNotice({ hadCode: true, errorCode: null, next: PASSWORD_PAGE })).toBe("inna-przegladarka");
  });
});
