/** Text of a contract termination letter ("wypowiedzenie umowy"). Built in the browser; nothing is stored. */
export interface NoticeLetterInput {
  kind: "general" | "oc";
  city: string;
  date: string;
  fullName: string;
  address: string;
  company: string;
  service: string;
  contractNumber: string;
  /** OC only: car make and registration number. */
  vehicle: string;
  /** OC only: the last day of the current policy. */
  policyEnd: string;
}

const or = (value: string, placeholder: string) => value.trim() || placeholder;

export function buildNoticeLetter(input: NoticeLetterInput): string {
  const header = [
    `${or(input.city, "[miejscowość]")}, ${or(input.date, "[data]")}`,
    "",
    or(input.fullName, "[imię i nazwisko]"),
    or(input.address, "[adres]"),
    "",
    or(input.company, "[nazwa firmy]"),
    "",
  ];
  const body =
    input.kind === "oc"
      ? [
          "Wypowiedzenie umowy ubezpieczenia OC posiadaczy pojazdów mechanicznych",
          "",
          `Na podstawie art. 28 ust. 1 ustawy z dnia 22 maja 2003 r. o ubezpieczeniach obowiązkowych, Ubezpieczeniowym Funduszu Gwarancyjnym i Polskim Biurze Ubezpieczycieli Komunikacyjnych wypowiadam umowę ubezpieczenia OC nr ${or(input.contractNumber, "[numer polisy]")} dotyczącą pojazdu ${or(input.vehicle, "[marka, numer rejestracyjny]")}, zawartą na okres do dnia ${or(input.policyEnd, "[data końca polisy]")}.`,
          "",
          "Proszę o potwierdzenie przyjęcia wypowiedzenia.",
        ]
      : [
          "Wypowiedzenie umowy",
          "",
          `Niniejszym wypowiadam umowę dotyczącą usługi ${or(input.service, "[nazwa usługi]")}${input.contractNumber.trim() ? ` (numer umowy / klienta: ${input.contractNumber.trim()})` : ""}, z zachowaniem okresu wypowiedzenia przewidzianego w umowie.`,
          "",
          "Proszę o potwierdzenie przyjęcia wypowiedzenia oraz wskazanie dnia, w którym umowa się rozwiąże.",
        ];
  return [...header, ...body, "", "", "............................................", "(podpis)"].join("\n");
}
