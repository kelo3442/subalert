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

  it("reads spreadsheet-safe and currency-prefixed amounts", () => {
    expect(parseSignedAmount("'-49,00")).toBe(-4900);
    expect(parseSignedAmount('="-1 299,00"')).toBe(-129900);
    expect(parseSignedAmount("PLN -23,99")).toBe(-2399);
    expect(parseSignedAmount("-23,99 zł")).toBe(-2399);
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

  it("reads banks that put money out in a separate column", () => {
    const csv = [
      "Numer rachunku/karty,Data transakcji,Data rozliczenia,Rodzaj transakcji,Na konto/Z konta,Odbiorca/Zleceniodawca,Opis,Obciążenia,Uznania,Saldo,Waluta",
      '"PL00",2026-10-05,2026-10-06,"PŁATNOŚĆ KARTĄ","","NETFLIX.COM","NETFLIX.COM AMSTERDAM","49.00","","1000.00","PLN"',
      '"PL00",2026-10-04,2026-10-04,"PRZELEW","PL11","Pracodawca","Wynagrodzenie","","5000.00","1049.00","PLN"',
      '"PL00",2026-10-03,2026-10-03,"PŁATNOŚĆ KARTĄ","","SPOTIFY","SPOTIFY P1","-23.99","","-3950.99","PLN"',
    ].join("\n");
    const analysis = analyzeStatement(csv);
    expect(analysis.mapping).toMatchObject({ amount: 7, amountIsDebit: true });
    expect(extractTransactions(analysis.rows, analysis.mapping!).map((t) => [t.date, t.amountCents])).toEqual([
      ["2026-10-05", 4900],
      ["2026-10-03", 2399],
    ]);
  });

  it("prefers a signed amount column over a money-out column", () => {
    const analysis = analyzeStatement("Data;Kwota;Obciążenia;Opis\n2026-10-05;-49,00;49,00;Netflix\n");
    expect(analysis.mapping).toMatchObject({ amount: 1, amountIsDebit: false });
  });

  it("reads ING exports in English and Polish", () => {
    const preamble = ['"List of transactions";;;;;"ING Bank Śląski S.A."', '"Selected dates:";"2026-07-17 - 2026-10-15";"Transaction sort:";"all"', ""];
    const english = [
      ...preamble,
      '"Transaction date";"Accounting date";"Counterparty\'s data";"Title";"Account number";"Bank name";"Details";"Transaction number";"Transaction amount (account currency)";"Currency";"Amount of hold/holds\' releases";"Currency"',
      `2026-10-12;2026-10-14;" ANTHROPIC* CLAUDE SUB  +14152360599 ";" Płatność kartą 12.10.2026 Nr karty 4246xx0000";'1915031/19730 ';;"TR.KART  ";'202628797306548365';-89,00;PLN;;`,
      `2026-10-12;2026-10-12;" JAN KOWALSKI ";" Przelew na telefon";'00105012141000000000000000 ';"ING Bank Śląski S.A.";"PRZELEW  ";'202628597224061325';73,00;PLN;;`,
      `2026-10-15;;" ZABKA Z0000 K.2  KATOWICE ";" Płatność kartą  15.10.2026";;;"";;;;-16,49;PLN`,
    ].join("\n");
    const analysis = analyzeStatement(english);
    expect(analysis.mapping).toMatchObject({ date: 0, amount: 8, description: [2, 3], currency: 9 });
    expect(extractTransactions(analysis.rows, analysis.mapping!)).toEqual([
      { date: "2026-10-12", amountCents: 8900, description: "ANTHROPIC* CLAUDE SUB  +14152360599 Płatność kartą 12.10.2026 Nr karty 4246xx0000" },
    ]);

    const polish = english.replace(
      /"Transaction date".*\n/,
      '"Data transakcji";"Data księgowania";"Dane kontrahenta";"Tytuł";"Nr rachunku";"Nazwa banku";"Szczegóły";"Nr transakcji";"Kwota transakcji (waluta rachunku)";"Waluta";"Kwota blokady/zwolnienie blokady";"Waluta"\n',
    );
    const pl = analyzeStatement(polish);
    expect(pl.mapping).toMatchObject({ date: 0, amount: 8, description: [2, 3], currency: 9 });
    expect(extractTransactions(pl.rows, pl.mapping!)).toHaveLength(1);
  });

  it("returns no mapping for files without recognisable columns", () => {
    const analysis = analyzeStatement("foo;bar;baz\n1;2;3\n");
    expect(analysis.mapping).toBeNull();
    expect(analysis.rows[analysis.headerGuess]).toEqual(["foo", "bar", "baz"]);
  });
});
