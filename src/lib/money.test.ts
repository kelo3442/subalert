import { describe, expect, it } from "vitest";
import { centsToInputValue, formatPLN, parseAmountToCents } from "./money";

describe("parseAmountToCents", () => {
  it.each([
    ["49,99", 4999],
    ["49.99", 4999],
    ["49,9", 4990],
    ["49", 4900],
    ["1 299,00", 129900],
    ["0,01", 1],
    ["23,99 zł", 2399],
  ])("parses %s", (input, expected) => {
    expect(parseAmountToCents(input)).toBe(expected);
  });

  it.each(["", "abc", "12,345", "-5", "1e3", "12,", ",5"])("rejects %s", (input) => {
    expect(parseAmountToCents(input)).toBeNull();
  });
});

describe("formatting", () => {
  it("formats Polish złoty", () => {
    expect(formatPLN(4999).replace(/\s/g, " ")).toBe("49,99 zł");
    expect(formatPLN(129900).replace(/\s/g, " ")).toBe("1299,00 zł");
    expect(formatPLN(1234500).replace(/\s/g, " ")).toBe("12 345,00 zł");
  });

  it("prepares form values", () => {
    expect(centsToInputValue(4990)).toBe("49,90");
  });
});
