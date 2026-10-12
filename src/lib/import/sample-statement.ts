import { addDays, addMonthsClamped, type ISODate } from "@/lib/dates";

interface SampleRow {
  date: ISODate;
  description: string;
  amount: string;
}

function monthly(today: ISODate, dayOffset: number, months: number, description: string, amount: string): SampleRow[] {
  const first = addDays(addMonthsClamped(today, -months), dayOffset);
  return Array.from({ length: months }, (_, i) => ({ date: addMonthsClamped(first, i), description, amount }));
}

/**
 * Demo statement (bank-export layout, made-up data) dated relative to today so
 * that people can try the import without their own file.
 */
export function buildSampleStatement(today: ISODate): string {
  const rows: SampleRow[] = [
    ...monthly(today, 3, 6, "NETFLIX.COM AMSTERDAM", "-49,00"),
    ...monthly(today, 8, 6, "Płatność kartą SPOTIFY P2A1B3C STOCKHOLM", "-23,99"),
    ...monthly(today, -4, 6, "Płatność kartą CITYFIT WARSZAWA", "-129,00"),
    ...monthly(today, 10, 6, "GOOGLE *Google One g.co/helppay", "-9,99"),
    ...monthly(today, 1, 5, "OPENAI *CHATGPT SUBSCR", "-99,00"),
    ...monthly(today, -10, 3, "DISNEY PLUS", "-37,99").map((row) => ({ ...row, date: addMonthsClamped(row.date, -4) })),
    { date: addDays(today, -340), description: "HOSTING I DOMENA ROCZNIE", amount: "-249,00" },
    { date: addDays(today, -340 - 365), description: "HOSTING I DOMENA ROCZNIE", amount: "-229,00" },
    ...monthly(today, 0, 6, "WYNAGRODZENIE", "6 500,00"),
    ...[2, 9, 13, 21, 30, 38, 44, 57, 63, 71, 85, 96].map((days, i) => ({
      date: addDays(today, -days),
      description: "Płatność kartą BIEDRONKA 4521",
      amount: `-${40 + ((i * 37) % 160)},${String((i * 13) % 100).padStart(2, "0")}`,
    })),
    { date: addDays(today, -26), description: "MEDIA EXPERT", amount: "-1 299,00" },
  ].filter((row) => row.date <= today);

  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  const lines = rows.map((row) => `${row.date};"${row.description}";"Konto osobiste";${row.amount};`);
  return ["Przykładowy wyciąg (dane demonstracyjne);;;;", "#Data operacji;#Opis operacji;#Rachunek;#Kwota;", ...lines].join("\n");
}
