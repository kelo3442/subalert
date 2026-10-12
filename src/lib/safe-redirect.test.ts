import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("keeps internal paths", () => {
    expect(safeRedirectPath("/panel/kalendarz")).toBe("/panel/kalendarz");
    expect(safeRedirectPath("/panel?x=1#a")).toBe("/panel?x=1#a");
  });

  it.each([
    null,
    "",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "/panel\n",
    "panel",
  ])("rejects %s", (input) => {
    expect(safeRedirectPath(input)).toBe("/panel");
  });
});
