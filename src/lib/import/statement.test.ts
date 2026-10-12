import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv";
import { decodeBankFile } from "./decode";
import { analyzeStatement, extractTransactions, parseSignedAmount, parseStatementDate } from "./statement";

describe("parseCsv", () => {
  it("handles quotes, escaped quotes, delimiters inside quotes and CRLF", () => {
    expect(parseCsv('a;"b;c";"say ""hi"""\r\n1;2;3\r\n\r\n', ";")).toEqual([
      ["a", "b;c", 'say "hi"'],
      ["1", "2", "3"],
    ]);
  });
});

describe("amounts and dates", () => {
  it.each([
    ["-49,00", -4900],
    ["-1 299,00", -129900],
    ["−23,99 PLN", -2399],
    ["-49.00", -4900],
    ["-1,299.00", -129900],
    ["-1.299,50", -129950],
    ["3500,00", 350000],
    ["+12,5", 1250],
  ])("parses %s", (input, expected) => {
    expect(parseSignedAmount(input)).toBe(expected);
  });

  it("rejects text", () => {
    expect(parseSignedAmount("abc")).toBeNull();
    expect(parseSignedAmount("")).toBeNull();
  });

  it.each([
    ["2026-10-05", "2026-10-05"],
    ["2026.10.05", "2026-10-05"],
    ["05.10.2026", "2026-10-05"],
    ["5-10-2026", "2026-10-05"],
    ["2026-10-05 14:22:01", "2026-10-05"],
  ])("parses date %s", (input, expected) => {
    expect(parseStatementDate(input)).toBe(expected);
  });

  it("rejects impossible dates", () => {
    expect(parseStatementDate("31.02.2026")).toBeNull();
    expect(parseStatementDate("wczoraj")).toBeNull();
  });
});

describe("decodeBankFile", () => {
  it("reads UTF-8 with BOM", () => {
    expect(decodeBankFile(new TextEncoder().encode("﻿opłata"))).toBe("opłata");
  });

  it("falls back to Windows-1250", () => {
    // "Płatność" in Windows-1250
    const bytes = new Uint8Array([0x50, 0xb3, 0x61, 0x74, 0x6e, 0x6f, 0x9c, 0xe6]);
    expect(decodeBankFile(bytes)).toBe("Płatność");
  });
});

const PREAMBLE_SEMICOLON = `Wyciąg z rachunku;;;
Klient: Jan Kowalski;;;
;;;
#Data operacji;#Opis operacji;#Rachunek;#Kategoria;#Kwota;#Saldo po operacji;
2026-10-05;"NETFLIX.COM  AMSTERDAM";"eKonto";"Rozrywka";-49,00 PLN;1 234,00 PLN;
2026-10-03;"WYNAGRODZENIE";"eKonto";"Wpływy";5 000,00 PLN;6 000,00 PLN;
`;

const QUOTED_COMMA = `"Data operacji","Data waluty","Typ transakcji","Kwota","Waluta","Saldo po transakcji","Opis transakcji"
"2026-10-02","2026-10-02","Płatność kartą","-23.99","PLN","+900.00","Tytuł: SPOTIFY P1234 STOCKHOLM"
"2026-10-01","2026-10-01","Płatność kartą","-15.00","EUR","+923.99","Tytuł: HOTEL"
`;

const ENGLISH = `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
CARD_PAYMENT,Current,2026-10-04 10:00:00,2026-10-05 10:00:00,OpenAI *ChatGPT Subscr,-99.00,0.00,PLN,COMPLETED,100.00
CARD_PAYMENT,Current,2026-10-04 11:00:00,,Shop,-20.00,0.00,PLN,DECLINED,100.00
`;

describe("analyzeStatement + extractTransactions", () => {
  it("finds the header after a preamble and keeps only outgoing payments", () => {
    const analysis = analyzeStatement(PREAMBLE_SEMICOLON);
    expect(analysis.mapping).toMatchObject({ headerIndex: 2, date: 0, amount: 4 });
    expect(extractTransactions(analysis.rows, analysis.mapping!)).toEqual([
      { date: "2026-10-05", amountCents: 4900, description: "NETFLIX.COM  AMSTERDAM" },
    ]);
  });

  it("reads quoted comma files and skips foreign currencies", () => {
    const analysis = analyzeStatement(QUOTED_COMMA);
    expect(extractTransactions(analysis.rows, analysis.mapping!)).toEqual([
      { date: "2026-10-02", amountCents: 2399, description: "Tytuł: SPOTIFY P1234 STOCKHOLM" },
    ]);
  });

  it("reads English exports and skips declined payments", () => {
    const analysis = analyzeStatement(ENGLISH);
    expect(extractTransactions(analysis.rows, analysis.mapping!)).toEqual([
      { date: "2026-10-04", amountCents: 9900, description: "OpenAI *ChatGPT Subscr" },
    ]);
  });

  it("returns no mapping for files without recognisable columns", () => {
    const analysis = analyzeStatement("foo;bar;baz\n1;2;3\n");
    expect(analysis.mapping).toBeNull();
    expect(analysis.rows[analysis.headerGuess]).toEqual(["foo", "bar", "baz"]);
  });
});
