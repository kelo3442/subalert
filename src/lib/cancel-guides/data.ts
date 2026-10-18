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
  {
    slug: "disney-plus",
    title: "Jak anulować Disney+",
    service: "Disney+",
    summary:
      "Subskrypcję Disney+ opłacaną bezpośrednio anulujesz w przeglądarce na DisneyPlus.com, w ustawieniach konta. Dostęp zostaje do końca bieżącego okresu subskrypcji. Jeśli płacisz przez Apple, Google lub operatora, anulujesz u nich.",
    methods: [
      {
        title: "Na stronie DisneyPlus.com",
        steps: [
          "Zaloguj się na [DisneyPlus.com](https://www.disneyplus.com) w przeglądarce na komputerze lub telefonie.",
          "Wybierz swój profil.",
          "Wybierz „Konto”.",
          "W obszarze „Subskrypcja” wybierz swoją subskrypcję Disney+.",
          "Wybierz „Anuluj subskrypcję”.",
        ],
        note: "Anulowanie subskrypcji nie usuwa konta Disney+ ani konta MyDisney.",
      },
      {
        title: "Przez Apple (iPhone, iPad)",
        steps: [
          "Otwórz aplikację „Ustawienia”.",
          "Dotknij swojego imienia i nazwiska u góry ekranu, a następnie dotknij opcji „Subskrypcje”.",
          "Wybierz subskrypcję Disney+ i ją anuluj.",
        ],
        note: "Więcej szczegółów znajdziesz w poradniku o [subskrypcjach na iPhonie](/jak-anulowac/iphone).",
      },
      {
        title: "Przez Google Play",
        steps: [
          "Otwórz sklep Google Play w przeglądarce i zaloguj się na konto Google.",
          "W prawym górnym rogu kliknij ikonę konta Google i wybierz „Płatności i subskrypcje”.",
          "Kliknij kartę „Subskrypcje” i wybierz subskrypcję Disney+.",
          "Kliknij „Zarządzaj”, a potem „Anuluj subskrypcję”.",
        ],
        note: "Więcej szczegółów znajdziesz w poradniku o [Google Play](/jak-anulowac/google-play).",
      },
      {
        title: "Przez operatora (Netia, Plus, Polsat Box, Polsat Box Go, JAMBOX, Vectra)",
        steps: [
          "Jeśli masz Disney+ w ofercie operatora, subskrypcją zarządzasz u tego operatora.",
          "Klienci JAMBOX i Vectra zarządzają subskrypcją na swoim koncie u operatora.",
          "Klienci Netii, Plusa, Polsat Box i Polsat Box Go zarządzają subskrypcją przez autoryzowanego sprzedawcę albo kontaktując się z operatorem.",
        ],
        note: "Kroki anulowania mogą się różnić w zależności od partnera. Sprawdź stronę pomocy swojego operatora.",
      },
    ],
    afterCancel: [
      "Anulowanie działa od końca bieżącego okresu subskrypcji. Do tego czasu nadal masz dostęp do Disney+.",
      "Po anulowaniu nie są pobierane kolejne opłaty.",
      "Jeśli zmienisz zdanie przed końcem okresu rozliczeniowego, zaloguj się na DisneyPlus.com, wybierz profil, „Konto”, a następnie „Ponownie wykup subskrypcję” i potwierdź opcją „Wyraź zgodę”.",
    ],
    tips: [
      "Anulowanie subskrypcji nie usuwa konta. Konto możesz usunąć osobno, po anulowaniu subskrypcji.",
      "Nowi i powracający subskrybenci nie mogą już płacić za Disney+ przez Apple ani Google. Nie dotyczy to obecnych subskrypcji rozliczanych przez Apple lub Google.",
    ],
    sources: [
      { label: "Disney+ Centrum pomocy: Jak anulować subskrypcję Disney+", url: "https://help.disneyplus.com/pl/article/disneyplus-cancel" },
      { label: "Disney+ Centrum pomocy: Partnerzy zewnętrzni Disney+", url: "https://help.disneyplus.com/pl/article/disneyplus-third-party-subscription" },
    ],
    verifiedAt: "2026-10-18",
  },
  {
    slug: "hbo-max",
    title: "Jak anulować HBO Max",
    service: "HBO Max",
    summary:
      "Subskrypcja HBO Max przedłuża się automatycznie, dopóki jej nie anulujesz. Sposób anulowania zależy od tego, kto Cię rozlicza: HBO Max, Apple, Google albo Twój dostawca internetu, telefonii lub telewizji.",
    methods: [
      {
        title: "Na stronie HBO Max",
        steps: [
          "Przejdź na stronę [HBOMax.com/subscription](https://hbomax.com/subscription). W razie potrzeby najpierw się zaloguj.",
          "Wybierz opcję „Anuluj subskrypcję”.",
          "Potwierdź anulowanie i zapamiętaj datę wygaśnięcia subskrypcji.",
        ],
        note: "Nie widzisz opcji anulowania? U góry ekranu sprawdź, kto rozlicza Twój pakiet (Podstawowy, Standardowy lub Premium), i anuluj subskrypcję u tego podmiotu, jednym z poniższych sposobów.",
      },
      {
        title: "Na iPhonie lub iPadzie (płatność przez Apple)",
        steps: [
          "Otwórz aplikację Ustawienia.",
          "Wybierz swoje imię i nazwisko.",
          "Wybierz „Subskrypcje”.",
          "Wybierz HBO Max z listy subskrypcji, a następnie wybierz opcję „Anuluj subskrypcję”.",
        ],
        note: "Zaloguj się na konto Apple użyte do zakupu. Więcej w poradniku o [subskrypcjach na iPhonie](/jak-anulowac/iphone).",
      },
      {
        title: "W Google Play (płatność przez Google)",
        steps: [
          "Na telefonie lub tablecie z Androidem otwórz sklep Google Play.",
          "W prawym górnym rogu wybierz ikonę profilu.",
          "Wybierz „Płatności i subskrypcje”, a następnie sekcję „Subskrypcja”.",
          "Wybierz HBO Max z listy subskrypcji, a następnie opcję „Anuluj subskrypcję”.",
        ],
        note: "Zaloguj się na konto Google użyte do zakupu. Więcej w poradniku o [Google Play](/jak-anulowac/google-play).",
      },
      {
        title: "U dostawcy internetu, telefonii lub telewizji",
        steps: ["Zaloguj się w witrynie swojego dostawcy.", "Anuluj HBO Max w jego centrum pomocy albo skontaktuj się z dostawcą bezpośrednio."],
      },
    ],
    afterCancel: [
      "Możesz oglądać do końca bieżącego okresu rozliczeniowego.",
      "Jeśli masz pakiet dodatkowy Sport, zostanie on anulowany po zakończeniu pakietu bazowego, a za niewykorzystane dni pakietu Sport dostaniesz zwrot.",
      "Przy płatności przez Apple lub Google Play powinien przyjść e-mail z potwierdzeniem anulowania.",
    ],
    tips: [
      "Nie wiesz, kto Cię rozlicza? Na [HBOMax.com/subscription](https://hbomax.com/subscription) albo w aplikacji HBO Max wybierz swój profil, a następnie opcję „Subskrypcja”.",
      "Usunięcie aplikacji HBO Max nie anuluje subskrypcji.",
      "Anuluj przed datą kolejnego przedłużenia, żeby uniknąć dalszych opłat.",
    ],
    sources: [{ label: "Centrum pomocy HBO Max: Jak anulować przedłużenie subskrypcji HBO Max?", url: "https://help.hbomax.com/pl-pl/Answer/Detail/000002526" }],
    verifiedAt: "2026-10-18",
  },
  {
    slug: "amazon-prime",
    title: "Jak anulować Amazon Prime",
    service: "Amazon",
    summary:
      "Członkostwo Amazon Prime zakończysz w każdej chwili na amazon.pl, także w czasie darmowego okresu próbnego. Prime Video jest częścią Prime, więc anulowanie Prime kończy też Prime Video. Osobną subskrypcję samego Prime Video anulujesz na primevideo.com.",
    methods: [
      {
        title: "Na stronie amazon.pl",
        steps: [
          "Zaloguj się na swoje konto i przejdź do sekcji [„Mój Prime”](https://www.amazon.pl/gp/primecentral).",
          "Zobaczysz tu swój plan, datę odnowienia oraz opcję „Zarządzaj subskrypcją Prime”.",
          "Kliknij „Zaktualizuj ustawienia” i „Anuluj subskrypcję”.",
          "Wybierz opcję „Kontynuuj, aby anulować”.",
          "Przy płatnej subskrypcji zdecyduj, czy anulujesz Prime od razu, czy subskrypcja ma się skończyć w ostatnim dniu jej obowiązywania.",
        ],
        note: "Przy anulowaniu od razu strona sama pokaże, czy należy Ci się zwrot i w jakiej wysokości.",
      },
      {
        title: "W czasie darmowego okresu próbnego",
        steps: [
          "Przejdź do sekcji [„Mój Prime”](https://www.amazon.pl/gp/primecentral) i wybierz „Zarządzaj subskrypcją Prime”.",
          "Kliknij „Zaktualizuj ustawienia” i „Anuluj subskrypcję”, a potem „Kontynuuj, aby anulować”.",
          "Kliknij „Zakończ w dniu …”. Data to ostatni dzień Twojej subskrypcji.",
        ],
        note: "Subskrypcja skończy się po upływie darmowego okresu i nie zmieni się w płatne członkostwo.",
      },
      {
        title: "Osobna subskrypcja Prime Video (primevideo.com)",
        steps: [
          "Przejdź do sekcji [„Konto i ustawienia”](https://www.primevideo.com/settings) na primevideo.com.",
          "Wybierz kartę „Moje konto”.",
          "Przy subskrypcji Prime Video wybierz opcję „Zakończ subskrypcję”.",
        ],
        note: "Jeśli Prime Video masz w ramach Amazon Prime, w obszarze „Członkostwo w programie Prime” wybierz „Edytuj w Amazon” i anuluj Prime na amazon.pl.",
      },
      {
        title: "Przez obsługę klienta, formularz lub operatora",
        steps: [
          "Możesz zrezygnować z członkostwa, kontaktując się z obsługą klienta Amazon.",
          "Możesz też wysłać [formularz rezygnacji](https://m.media-amazon.com/images/G/48/legal/CancellationFormPrimePL.pdf) pocztą na adres podany w formularzu.",
          "Jeśli subskrypcję założono przez inny podmiot, np. operatora komórkowego, skontaktuj się z nim. Obowiązują wtedy jego zasady płatności i anulowania.",
        ],
      },
    ],
    afterCancel: [
      "Jeśli wybierzesz zakończenie w ostatnim dniu subskrypcji, do tego dnia nadal korzystasz z Prime.",
      "Jeśli w bieżącym okresie rozliczeniowym nie korzystano z żadnych korzyści Prime, dostaniesz pełny zwrot opłaty za ten okres.",
      "Jeśli z korzyści korzystano, możesz mieć prawo do anulowania od razu z częściowym zwrotem. Jeśli zwrot nie przysługuje, subskrypcja skończy się z końcem opłaconego okresu.",
      "Zwrot trafia na tę samą metodę płatności, którą pobrano opłatę.",
      "Dodatkowe subskrypcje związane z Prime lub Prime Video nie odnowią się po zakończeniu członkostwa Prime.",
    ],
    tips: [
      "Anuluj darmowy okres próbny przed jego końcem. Inaczej Amazon pobierze pierwszą opłatę.",
      "Przy płatności BLIK subskrypcja nie odnawia się automatycznie.",
      "Przez 14 dni od rozpoczęcia subskrypcji możesz odstąpić od umowy. Zwrot będzie proporcjonalnie mniejszy, jeśli w tym czasie korzystano z korzyści Prime.",
    ],
    sources: [
      { label: "Amazon.pl Pomoc: Kończenie subskrypcji Amazon Prime", url: "https://www.amazon.pl/gp/help/customer/display.html?nodeId=GTJQ7QZY7QL2HK4Y" },
      { label: "Amazon.pl Pomoc: Warunki Amazon Prime", url: "https://www.amazon.pl/gp/help/customer/display.html?nodeId=G2B9L3YR7LR8J4XP" },
      { label: "Amazon.pl Pomoc: Opłata za członkostwo w programie Amazon Prime", url: "https://www.amazon.pl/gp/help/customer/display.html?nodeId=G34EUPKVMYFW8N2U" },
      { label: "Prime Video Pomoc: Anulowanie subskrypcji Prime Video", url: "https://www.primevideo.com/help?nodeId=GWGDSNXVPJ93UW5V&language=pl_PL" },
    ],
    verifiedAt: "2026-10-18",
  },
  {
    slug: "canal-plus",
    title: "Jak anulować CANAL+ online",
    service: "CANAL+",
    summary:
      "Subskrypcję CANAL+ online z płatnością miesięczną anulujesz w przeglądarce na canalplus.com, nie w aplikacji. Dostęp zostaje do końca obecnego okresu rozliczeniowego. Przy umowie z zobowiązaniem obowiązują zasady jak przy umowie o telewizję satelitarną.",
    methods: [
      {
        title: "Na stronie canalplus.com (płatność miesięczna)",
        steps: [
          "Zaloguj się na stronie [canalplus.com](https://www.canalplus.com/pl/) i wybierz „Awatar profilu”.",
          "Wybierz zakładkę „Moje Konto”.",
          "Przejdź do zakładki „Moje Usługi”.",
          "Kliknij opcję „Zarządzaj” przy pakiecie głównym. Po prawej stronie zobaczysz nowe menu.",
          "W nowym menu kliknij przycisk „ANULUJ SUBSKRYPCJĘ”.",
        ],
        note: "Zmiana i wyłączenie pakietów są możliwe tylko w przeglądarce. Nie zrobisz tego w aplikacji CANAL+.",
      },
      {
        title: "Umowa z zobowiązaniem",
        steps: [
          "Jeśli przy CANAL+ online podpisałeś umowę z zobowiązaniem, rezygnujesz tak samo jak z umowy o telewizję satelitarną.",
          "Wyślij rezygnację listem poleconym na adres: CANAL+ Polska S.A., skr. poczt. 8, 02-100 Warszawa.",
          "Możesz też zalogować się do Strefy CANAL+ i przez formularz kontaktowy przesłać skan lub zdjęcie rezygnacji, albo zanieść ją do salonu CANAL+.",
          "W piśmie podaj imię i nazwisko, numer umowy, numer kontaktowy i oświadczenie o rezygnacji. Pismo podpisz odręcznie.",
        ],
        note: "Umowę rozwiążesz z końcem okresu, na jaki ją zawarto, jeśli rezygnacja dotrze najpóźniej 30 dni przed jego upływem. Możesz też zrezygnować wcześniej, ale wtedy zapłacisz odszkodowanie lub zwrócisz ulgi, proporcjonalnie do czasu wykorzystania.",
      },
    ],
    afterCancel: [
      "Dostęp do usług masz do końca obecnego okresu rozliczeniowego. Subskrypcja nie odnowi się na kolejny miesiąc.",
      "Datę końca cyklu rozliczeniowego sprawdzisz w zakładce „Moje Konto” na canalplus.com.",
      "Żeby wrócić, zaloguj się, wybierz pakiet i metodę płatności. Nie musisz zakładać nowego konta.",
    ],
    tips: [
      "Anulowanie subskrypcji to nie to samo co usunięcie konta. Po usunięciu konta od razu tracisz dostęp do wszystkich pakietów i historii płatności.",
      "Złożoną rezygnację z umowy wycofasz w Strefie CANAL+: „Moja oferta”, potem „Obecna oferta”, „Wycofaj rezygnację” i „Akceptuj”.",
    ],
    sources: [
      { label: "CANAL+ Pomoc: Jak anulować subskrypcję CANAL+ online", url: "https://pl.canalplus.com/pomoc/jak-anulowac-subskrypcje-canal-online" },
      { label: "CANAL+ Pomoc: Jak mogę sprawdzić, do kiedy mam aktywny pakiet", url: "https://pl.canalplus.com/pomoc/jak-moge-sprawdzic-do-kiedy-mam-aktywny-pakiet-w-canal-online" },
      { label: "CANAL+ Pomoc: Jak zrezygnować z umowy?", url: "https://pl.canalplus.com/pomoc/jak-zrezygnowac-z-umowy" },
      { label: "CANAL+ Pomoc: Chcę wycofać złożoną rezygnację", url: "https://pl.canalplus.com/pomoc/chce-wycofac-zlozona-rezygnacje-jak-to-zrobic" },
    ],
    verifiedAt: "2026-10-18",
  },
  {
    slug: "player",
    title: "Jak anulować Player",
    service: "Player",
    summary:
      "Subskrypcję Playera z płatnością odnawialną (karta, płatność powtarzalna BLIK) anulujesz w przeglądarce, w zakładce „Moje zakupy i karty”, najpóźniej 24 godziny przed nowym okresem rozliczeniowym. Przy płatności rachunkiem Play możesz też zrezygnować SMS-em.",
    methods: [
      {
        title: "Na komputerze (player.pl)",
        steps: [
          "Zaloguj się na swoje konto na stronie [player.pl](https://www.player.pl) w przeglądarce.",
          "Rozwiń menu główne, klikając swój awatar w prawym górnym rogu.",
          "Kliknij zakładkę „Moje zakupy i karty”.",
          "Odszukaj pakiet w zakładce „Moje zamówienia”.",
          "Kliknij przycisk „Rezygnuję z pakietu” przy wybranej usłudze.",
          "Zatwierdź wybór przyciskiem „Tak, rezygnuję z pakietu”.",
        ],
        note: "Dotyczy płatności kartą i płatności powtarzalnej BLIK. Anulowanie nie jest dostępne w aplikacjach na telewizorach, iPhone'ach ani konsolach.",
      },
      {
        title: "W przeglądarce na telefonie",
        steps: [
          "Otwórz [player.pl](https://www.player.pl) w przeglądarce na telefonie, np. Chrome lub Safari, i zaloguj się.",
          "Wybierz „Moje konto”, a potem „Moje zakupy i karty”.",
          "Wybierz subskrypcję i rozwiń pakiet małą strzałką, aby zobaczyć szczegóły.",
          "Wybierz „Rezygnuję z pakietu” i zatwierdź swój wybór.",
        ],
        note: "Player zaleca zrobienie tego w przeglądarce, a nie w aplikacji mobilnej.",
      },
      {
        title: "Płatność rachunkiem Play",
        steps: [
          "Zrezygnuj na swoim koncie Player, tak jak na komputerze.",
          "Albo wyślij SMS o treści „STOP PLAYER” pod numer 80555 z numeru telefonu przypisanego do subskrypcji.",
        ],
        note: "Dla pakietów dodatkowych są osobne kody, np. „STOP PLAYERHBO”, „STOP PLAYERELS” czy „STOP PLAYEREUS”. Pełną listę znajdziesz w pomocy Playera.",
      },
    ],
    afterCancel: [
      "Pakiet działa do końca bieżącego okresu rozliczeniowego.",
      "Jeśli anulujesz później niż 24 godziny przed nowym okresem rozliczeniowym, pakiet zostanie przedłużony.",
      "Datę odnowienia lub wygaśnięcia pakietu sprawdzisz w „Moje zakupy i karty”, w sekcji „Moje zamówienia”.",
    ],
    tips: [
      "Usunięcie karty z konta nie oznacza rezygnacji z usługi.",
      "Płatność powtarzalną BLIK możesz też anulować w aplikacji lub na stronie swojego banku.",
      "Pakiet opłacony jednorazowo (BLIK jednorazowy, przelew) wygaśnie sam po opłaconym okresie.",
    ],
    sources: [
      { label: "Pomoc Player: Jak anulować płatność odnawialną w Playerze?", url: "https://pomoc.player.pl/article/player-anulowanie-platnosci" },
      { label: "Pomoc Player: Płatność rachunkiem Play", url: "https://pomoc.player.pl/article/player-play" },
      { label: "Pomoc Player: Księgowanie płatności i zasady odnowienia subskrypcji", url: "https://pomoc.player.pl/article/ksiegowanie-odnowienie-platnosci" },
    ],
    verifiedAt: "2026-10-18",
  },
  {
    slug: "skyshowtime",
    title: "Jak anulować SkyShowtime",
    service: "SkyShowtime",
    summary:
      "Sposób anulowania SkyShowtime zależy od tego, gdzie wykupiono subskrypcję: na skyshowtime.com, w App Store, w Google Play albo u operatora. Po anulowaniu możesz oglądać do końca cyklu rozliczeniowego.",
    methods: [
      {
        title: "Na stronie skyshowtime.com",
        steps: [
          "Przejdź do sekcji [„Plany i płatności”](https://www.skyshowtime.com/pl/account/plans). W razie potrzeby najpierw się zaloguj.",
          "Pod „Zarządzaj swoim planem” kliknij swój plan, na przykład „Premium – miesięcznie”.",
          "Przewiń w dół do sekcji „SZYBKIE LINKI” i kliknij „Anuluj”.",
          "Na kolejnych stronach klikaj „Kontynuuj”, aż zobaczysz „Potwierdź anulowanie”, i kliknij tę opcję.",
        ],
        note: "SkyShowtime zaleca zarządzanie płatnościami na koncie online, a nie w aplikacji.",
      },
      {
        title: "App Store (iPhone, iPad)",
        steps: [
          "Otwórz aplikację Ustawienia i stuknij swoje imię i nazwisko.",
          "Stuknij opcję „Subskrypcje”.",
          "Stuknij subskrypcję SkyShowtime, a potem opcję „Anuluj subskrypcję”.",
        ],
        note: "Tej subskrypcji nie anulujesz w aplikacji SkyShowtime. Więcej: [subskrypcje na iPhonie](/jak-anulowac/iphone).",
      },
      {
        title: "Google Play (Android)",
        steps: [
          "Przejdź do [subskrypcji w Google Play](https://play.google.com/store/account/subscriptions).",
          "Wybierz subskrypcję SkyShowtime.",
          "Stuknij opcję „Anuluj subskrypcję” i postępuj zgodnie z instrukcjami.",
        ],
        note: "Odinstalowanie aplikacji nie anuluje subskrypcji. Więcej: [Google Play](/jak-anulowac/google-play).",
      },
      {
        title: "U operatora",
        steps: ["Skontaktuj się z dostawcą, u którego aktywowano SkyShowtime, i poproś o instrukcje anulowania."],
        note: "Gdy SkyShowtime masz w pakiecie operatora, rozliczeniami zarządza dostawca.",
      },
    ],
    afterCancel: [
      "Możesz oglądać do końca cyklu rozliczeniowego.",
      "Na adres e-mail konta dostaniesz potwierdzenie z datą końca dostępu.",
      "Konto SkyShowtime zostaje aktywne, więc subskrypcję możesz wznowić w dowolnym momencie. Po anulowaniu tracisz jednak obecną ofertę promocyjną.",
      "Jeśli subskrypcja ma minimalny okres obowiązywania, anulowanie zadziała dopiero po jego zakończeniu.",
    ],
    tips: [
      "Jeśli płacisz poleceniem zapłaty, anuluj je też w swoim banku.",
      "Opłata nadal jest pobierana? Sprawdź, czy nie masz drugiego konta SkyShowtime na inny adres e-mail.",
    ],
    sources: [
      { label: "SkyShowtime: Jak anulować SkyShowtime", url: "https://www.skyshowtime.com/pl/help/article/how-do-i-cancel-my-skyshowtime-subscription" },
      { label: "SkyShowtime: Anulowanie w sklepie Google Play lub App Store", url: "https://www.skyshowtime.com/pl/help/article/changing-your-skyshowtime-plan-on-the-app-stores" },
      { label: "SkyShowtime: Co to jest dostawca partnerski?", url: "https://www.skyshowtime.com/pl/help/article/what-is-a-skyshowtime-partner-provider" },
      { label: "SkyShowtime: Naliczono opłatę po anulowaniu", url: "https://www.skyshowtime.com/pl/help/article/charged-after-cancelling-skyshowtime" },
    ],
    verifiedAt: "2026-10-18",
  },
  {
    slug: "apple-music",
    title: "Jak anulować Apple Music",
    service: "Apple",
    summary:
      "Subskrypcję Apple Music anulujesz w Ustawieniach na iPhonie lub iPadzie, w App Store na Macu albo w przeglądarce na music.apple.com. Jeśli płacisz przez Google Play, anulujesz ją w aplikacji Apple Music na Androidzie lub na play.google.com.",
    methods: [
      {
        title: "iPhone lub iPad",
        steps: [
          "Otwórz Ustawienia i stuknij swoje imię i nazwisko.",
          "Stuknij pozycję „Subskrypcje”.",
          "Stuknij subskrypcję Apple Music.",
          "Stuknij opcję „Anuluj subskrypcję”. Może być konieczne przewinięcie w dół.",
        ],
        note: "Jeśli nie widzisz przycisku „Anuluj” lub widoczny jest czerwony tekst o wygaśnięciu, subskrypcja jest już anulowana. Więcej o [subskrypcjach na iPhonie](/jak-anulowac/iphone).",
      },
      {
        title: "Mac",
        steps: [
          "Otwórz App Store i kliknij swoje imię i nazwisko u dołu paska bocznego (albo „Zaloguj się”).",
          "Na wyświetlonej stronie kliknij swoje imię i nazwisko. Może pojawić się prośba o zalogowanie.",
          "Kliknij „Subskrypcje”, a potem subskrypcję Apple Music.",
          "Kliknij opcję „Anuluj subskrypcję”.",
        ],
      },
      {
        title: "W przeglądarce (music.apple.com)",
        steps: [
          "Otwórz stronę [music.apple.com](https://music.apple.com/pl/browse?l=pl) i zaloguj się („Sign In (Zaloguj się)”).",
          "Kliknij ikonę Moje konto i wybierz „Settings (Ustawienia)”.",
          "Przewiń do sekcji „Subscriptions (Subskrypcje)” i kliknij „Manage (Zarządzaj)”.",
          "Wybierz opcję „Cancel Subscription (Anuluj subskrypcję)”.",
        ],
        note: "Subskrypcje Apple możesz też anulować na [account.apple.com](https://account.apple.com/account/manage/section/subscriptions).",
      },
      {
        title: "Android",
        steps: [
          "Jeśli płacisz przez Google Play, anuluj subskrypcję w aplikacji Apple Music na Androidzie lub na [play.google.com](https://play.google.com/store/account/subscriptions).",
          "Jeśli rozliczenia prowadzi Apple, przejdź na [account.apple.com](https://account.apple.com/account/manage/section/subscriptions), zaloguj się i postępuj zgodnie z instrukcjami.",
        ],
      },
    ],
    afterCancel: [
      "Po wygaśnięciu subskrypcji nie odtworzysz już utworów z katalogu Apple Music, a playlisty z jego utworami nie będą dostępne.",
      "Utwory i playlisty, które miałeś na urządzeniu przed zasubskrybowaniem Apple Music, zostaną.",
    ],
    tips: [
      "Jeśli nie chcesz, żeby okres próbny zamienił się w płatną subskrypcję, anuluj go najpóźniej 24 godziny przed jego końcem.",
      "Nie widzisz subskrypcji? Wyszukaj w poczcie „potwierdzenie od Apple” lub „faktura od Apple” i sprawdź, którego konta Apple użyto.",
      "Jeśli masz Apple Music od operatora komórkowego, skontaktuj się z nim.",
    ],
    sources: [
      { label: "Wsparcie Apple: Jak anulować subskrypcję usługi Apple Music", url: "https://support.apple.com/pl-pl/118399" },
      { label: "Wsparcie Apple: Anulowanie subskrypcji Apple", url: "https://support.apple.com/pl-pl/118428" },
    ],
    verifiedAt: "2026-10-18",
  },
  {
    slug: "tidal",
    title: "Jak anulować TIDAL",
    service: "TIDAL",
    summary:
      "Subskrypcję lub okres próbny TIDAL anulujesz w każdej chwili. Jeśli płacisz bezpośrednio TIDAL, zrobisz to na account.tidal.com albo w aplikacji na Androidzie. Jeśli płacisz przez Apple lub Google Play, anulujesz u nich.",
    methods: [
      {
        title: "Na stronie account.tidal.com",
        steps: [
          "Przejdź na stronę [account.tidal.com](https://account.tidal.com/) i zaloguj się.",
          "Przejdź do sekcji „Subskrypcja”.",
          "Kliknij „Anuluj subskrypcję” i potwierdź anulowanie.",
        ],
        note: "W sekcji „Subskrypcja” widzisz też datę odnowienia. W ten sposób anulujesz także okres próbny.",
      },
      {
        title: "W aplikacji TIDAL na Androidzie",
        steps: [
          "Otwórz aplikację TIDAL i kliknij ikonę serca.",
          "Kliknij ikonę koła zębatego w prawym górnym rogu.",
          "Kliknij „Edytuj”, a następnie „Zarządzaj subskrypcją”.",
          "Przewiń w dół i kliknij „Subskrypcja”, a potem „Anuluj subskrypcję”.",
        ],
        note: "Nazwy w aplikacji mogą się trochę różnić od opisu w pomocy TIDAL. Jeśli coś się nie zgadza, anuluj na account.tidal.com.",
      },
      {
        title: "Płatność przez Apple (iPhone, iPad)",
        steps: ["Anuluj subskrypcję w ustawieniach Apple, a nie w TIDAL, według poradnika o [subskrypcjach na iPhonie](/jak-anulowac/iphone)."],
      },
      {
        title: "Płatność przez Google Play",
        steps: ["Anuluj subskrypcję w Google Play, według poradnika o [Google Play](/jak-anulowac/google-play)."],
        note: "Jeśli w Google Play nie ma aktywnej subskrypcji, konto mogło zostać założone na inny adres e-mail.",
      },
    ],
    afterCancel: [
      "Po anulowaniu masz dostęp do konta TIDAL do końca cyklu rozliczeniowego.",
      "W UE możesz dostać pełny zwrot w ciągu 14 dni od zakupu, jeśli nie zacząłeś słuchać ani pobierać treści.",
      "TIDAL nie zwraca pieniędzy za zakupy przez Apple lub Google Play. W tej sprawie skontaktuj się z nimi.",
    ],
    tips: [
      "TIDAL rozlicza się w cyklu 30-dniowym, więc dwie opłaty w jednym miesiącu kalendarzowym nie muszą być błędem.",
      "Usunięcie konta TIDAL nie anuluje subskrypcji opłacanej przez Apple lub Google. Usunięcie konta jest też trwałe, więc jeśli chcesz tylko przestać płacić, anuluj subskrypcję.",
    ],
    sources: [
      { label: "TIDAL: Anulowanie subskrypcji TIDAL lub okresu próbnego", url: "https://support.tidal.com/hc/pl/articles/201314601-Anulowanie-subskrypcji-TIDAL-lub-okresu-pr%C3%B3bnego" },
      { label: "TIDAL: Zarządzaj swoim kontem TIDAL", url: "https://support.tidal.com/hc/pl/articles/28548632499601-Zarz%C4%85dzaj-swoim-kontem-TIDAL" },
      { label: "TIDAL: Najczęściej zadawane pytania dotyczące zwrotów", url: "https://support.tidal.com/hc/pl/articles/22401976776593-Najcz%C4%99%C5%9Bciej-zadawane-pytania-dotycz%C4%85ce-zwrot%C3%B3w" },
    ],
    verifiedAt: "2026-10-18",
  },
];

export function getCancelGuide(slug: string): CancelGuide | undefined {
  return CANCEL_GUIDES.find((guide) => guide.slug === slug);
}
