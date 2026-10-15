import type { CancelGuide } from "./types";

// Every step below was checked against the linked official help page on the
// date in verifiedAt. UI labels are quoted exactly as those pages give them.
export const CANCEL_GUIDES: CancelGuide[] = [
  {
    slug: "netflix",
    title: "Jak anulować Netflix",
    service: "Netflix",
    summary:
      "Członkostwo w Netflix anulujesz w kilka kliknięć na stronie zarządzania członkostwem. Możesz oglądać do końca opłaconego okresu, a potem konto zamknie się samo.",
    methods: [
      {
        title: "Na stronie Netflix",
        steps: [
          "Przejdź na [stronę zarządzania członkostwem](https://www.netflix.com/cancelplan). W razie potrzeby najpierw się zaloguj.",
          "Naciśnij lub kliknij opcję „Anuluj”.",
          "W oknie anulowania wybierz „Potwierdź anulowanie”.",
          "Gotowe. Netflix wyśle e-mail z potwierdzeniem na adres powiązany z kontem.",
        ],
        note: "Wylogowanie się z konta ani usunięcie aplikacji Netflix nie anuluje członkostwa.",
      },
      {
        title: "Gdy płacisz przez partnera, np. operatora",
        steps: [
          "Wejdź na [stronę Konto](https://www.netflix.com/account) i sprawdź sekcję „Członkostwo”.",
          "Znajdziesz tam link do anulowania albo instrukcję, jak skontaktować się z partnerem rozliczeniowym.",
          "Anuluj członkostwo u tego partnera.",
        ],
        note: "Jeśli na stronie zarządzania członkostwem nie widzisz opcji anulowania, za Netflix płacisz przez partnera rozliczeniowego.",
      },
    ],
    afterCancel: [
      "Jeśli zrezygnujesz przed końcem okresu rozliczeniowego, możesz oglądać do jego końca. Potem konto zamknie się automatycznie.",
      "Netflix nie pobierze kolejnych opłat, chyba że odnowisz konto.",
      "Kiedy konto zostanie zamknięte, sprawdzisz w „Historii płatności”.",
    ],
    tips: [
      "Jeśli chcesz tylko zrobić przerwę, sprawdź na stronie anulowania, czy możesz wstrzymać członkostwo. Ta opcja nie jest dostępna w każdym planie i przy każdej metodzie płatności.",
    ],
    sources: [{ label: "Pomoc Netflix: Jak anulować członkostwo w serwisie Netflix", url: "https://help.netflix.com/pl/node/407" }],
    verifiedAt: "2026-10-15",
  },
  {
    slug: "spotify",
    title: "Jak anulować Spotify Premium",
    service: "Spotify",
    summary:
      "Z planu Spotify Premium zrezygnujesz w każdej chwili na stronie konta. Premium działa do końca okresu rozliczeniowego, a potem konto przechodzi na darmową wersję.",
    methods: [
      {
        title: "Na stronie konta Spotify",
        steps: [
          "Przejdź do sekcji [„Zarządzaj swoim planem”](https://www.spotify.com/account/subscription/manage/). W razie potrzeby się zaloguj.",
          "Wybierz opcję „Anuluj subskrypcję”.",
        ],
        note: "Subskrypcję możesz też anulować, wypełniając [formularz Spotify](https://www.spotify.com/account/cancel/pdf/) i wysyłając go do firmy.",
      },
      {
        title: "Gdy plan jest od operatora albo dostawcy internetu",
        steps: [
          "Przejdź do sekcji [„Zarządzaj swoim planem”](https://www.spotify.com/account/subscription/manage/).",
          "Sprawdź „Płatność”. Znajdziesz tam firmę, przez którą płacisz, i sposób kontaktu z nią.",
          "Zrezygnuj z planu u tej firmy.",
        ],
        note: "Na plan od firmy partnerskiej wskazuje brak opcji zmiany planu na stronie konta.",
      },
    ],
    afterCancel: [
      "Premium pozostaje aktywne do kolejnego okresu rozliczeniowego. Potem konto przechodzi na bezpłatną wersję Spotify.",
      "Jeśli anulujesz w trakcie bezpłatnego okresu próbnego, konto od razu przejdzie na wersję bezpłatną, a okresu próbnego nie da się aktywować ponownie.",
      "Twoje utwory i playlisty zostają. Nadal możesz słuchać muzyki z reklamami.",
    ],
    tips: [
      "Plan Family lub Duo anuluje tylko jego właściciel. Członek planu może poprosić o usunięcie z planu, ale sam plan nie zostanie wtedy anulowany.",
      "Masz Spotify Free, a mimo to pobrano opłatę? Prawdopodobnie masz Premium na innym koncie Spotify. Zaloguj się na nie i anuluj tam.",
      "Płacisz za Spotify przez Google Play? Zajrzyj do [poradnika Google Play](/jak-anulowac/google-play).",
    ],
    sources: [
      { label: "Pomoc Spotify: Jak anulować Premium?", url: "https://support.spotify.com/pl/article/cancel-premium/" },
      { label: "Pomoc Spotify: Płatność za Spotify przez Google Play", url: "https://support.spotify.com/pl/article/google-play-help/" },
    ],
    verifiedAt: "2026-10-15",
  },
  {
    slug: "youtube-premium",
    title: "Jak anulować YouTube Premium",
    service: "YouTube",
    summary:
      "YouTube Premium i YouTube Music Premium anulujesz na stronie płatnych subskrypcji YouTube. Z korzyści korzystasz do końca okresu rozliczeniowego.",
    methods: [
      {
        title: "W przeglądarce",
        steps: [
          "Wejdź na [youtube.com/paid_memberships](https://www.youtube.com/paid_memberships).",
          "Kliknij „Zarządzaj subskrypcją”.",
          "Kliknij „Dezaktywuj”.",
          "Kliknij „Kontynuuj”, aby anulować.",
          "Wybierz powód anulowania i kliknij „Dalej”.",
          "Kliknij „Tak, anuluj”.",
        ],
      },
      {
        title: "Gdy płacisz przez Apple albo Google Play",
        steps: [
          "Subskrypcję rozpoczętą w aplikacji YouTube na iPhonie lub iPadzie anulujesz na koncie Apple. Zobacz [poradnik dla iPhone'a](/jak-anulowac/iphone).",
          "Subskrypcję opłacaną przez Google Play anulujesz w ustawieniach Google Play. Zobacz [poradnik Google Play](/jak-anulowac/google-play).",
        ],
      },
    ],
    afterCancel: [
      "YouTube nie pobierze kolejnych opłat, chyba że odnowisz subskrypcję.",
      "Do korzyści z subskrypcji masz dostęp do końca okresu rozliczeniowego.",
    ],
    tips: [
      "Nie wiesz, czy subskrypcja jest już anulowana? Sprawdź sekcję „Płatne subskrypcje” na [youtube.com/paid_memberships](https://www.youtube.com/paid_memberships).",
      "Zamiast anulować, subskrypcję możesz też wstrzymać.",
    ],
    sources: [
      {
        label: "Pomoc YouTube: Anulowanie subskrypcji YouTube Premium lub YouTube Music Premium",
        url: "https://support.google.com/youtube/answer/6308278?hl=pl",
      },
    ],
    verifiedAt: "2026-10-15",
  },
  {
    slug: "iphone",
    title: "Jak anulować subskrypcję na iPhonie",
    service: "Apple",
    summary:
      "Subskrypcje Apple, np. iCloud+ czy Apple Music, oraz subskrypcje kupione w aplikacjach z App Store anulujesz w Ustawieniach iPhone'a.",
    methods: [
      {
        title: "Na iPhonie",
        steps: [
          "Otwórz Ustawienia i stuknij swoje imię i nazwisko.",
          "Stuknij „Subskrypcje”.",
          "Stuknij subskrypcję, którą chcesz anulować.",
          "Stuknij „Anuluj subskrypcję”. Przycisk może być niżej, więc w razie potrzeby przewiń ekran.",
        ],
        note: "Jeśli nie widzisz przycisku „Anuluj” albo widzisz czerwony tekst o wygaśnięciu, subskrypcja jest już anulowana.",
      },
      {
        title: "Gdy nie możesz znaleźć subskrypcji",
        steps: [
          "Wyszukaj w poczcie e-mail „potwierdzenie od Apple” albo „faktura od Apple”.",
          "Na potwierdzeniu sprawdź, którego konta Apple użyto.",
          "Jeśli to konto członka rodziny, poproś tę osobę o anulowanie. Nie możesz anulować subskrypcji członka rodziny.",
          "Jeśli to inne Twoje konto Apple, zaloguj się na nie i anuluj subskrypcję.",
        ],
        note: "Nie ma potwierdzenia od Apple? Subskrypcja mogła zostać kupiona w innej firmie. Sprawdź na wyciągu z konta, komu płacisz, i anuluj ją u tej firmy.",
      },
    ],
    afterCancel: [],
    tips: [
      "Jeśli korzystasz z okresu próbnego i nie chcesz płacić, anuluj subskrypcję najpóźniej 24 godziny przed jego końcem.",
      "Subskrypcję otrzymaną przez operatora sieci komórkowej lub innego usługodawcę anulujesz u tego operatora.",
    ],
    sources: [{ label: "Wsparcie Apple: Anulowanie subskrypcji Apple", url: "https://support.apple.com/pl-pl/118428" }],
    verifiedAt: "2026-10-15",
  },
  {
    slug: "google-play",
    title: "Jak anulować subskrypcję w Google Play",
    service: "Google Play",
    summary:
      "Subskrypcje kupione przez Google Play na Androidzie anulujesz na stronie subskrypcji w Google Play. Samo odinstalowanie aplikacji nie wystarczy.",
    methods: [
      {
        title: "Na telefonie z Androidem",
        steps: [
          "Zaloguj się na konto Google, na którym masz subskrypcję.",
          "Otwórz [subskrypcje w Google Play](https://play.google.com/store/account/subscriptions).",
          "Wybierz subskrypcję, którą chcesz anulować.",
          "Kliknij „Anuluj subskrypcję” i postępuj zgodnie z instrukcją.",
        ],
        note: "Odinstalowanie aplikacji nie powoduje anulowania subskrypcji.",
      },
    ],
    afterCancel: [
      "Z subskrypcji korzystasz do końca opłaconego okresu. Przykład z pomocy Google: roczna subskrypcja kupiona 1 stycznia i anulowana 1 lipca działa do 31 grudnia i nie zostanie odnowiona.",
      "Google nie zwraca pieniędzy za wcześniejsze okresy, poza wyjątkami opisanymi w zasadach zwrotów Google Play.",
    ],
    tips: [
      "Niektóre aplikacje pozwalają wstrzymać płatności zamiast anulować. Wybierz subskrypcję, kliknij „Zarządzaj”, a potem „Wstrzymaj płatności”. Okres wstrzymania to od tygodnia do 3 miesięcy, zależnie od aplikacji.",
      "Nie widzisz subskrypcji? Może być na innym koncie Google. Spróbuj przełączyć konto.",
    ],
    sources: [
      {
        label: "Pomoc Google Play: Anulowanie, wstrzymywanie i zmienianie subskrypcji w Google Play",
        url: "https://support.google.com/googleplay/answer/7018481?hl=pl",
      },
    ],
    verifiedAt: "2026-10-15",
  },
];

export function getCancelGuide(slug: string): CancelGuide | undefined {
  return CANCEL_GUIDES.find((guide) => guide.slug === slug);
}
