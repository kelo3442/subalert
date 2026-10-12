import type { CategoryKey } from "./categories";

export interface PopularService {
  name: string;
  category: CategoryKey;
  /** Official account / subscription page. Providers change these, so users can edit it. */
  manageUrl: string | null;
  cancelSteps: string[];
}

const APP_STORE_NOTE =
  "Jeśli płacisz przez App Store lub Google Play, anulujesz w ustawieniach subskrypcji sklepu, a nie w samej usłudze.";

export const POPULAR_SERVICES: PopularService[] = [
  {
    name: "Netflix",
    category: "video",
    manageUrl: "https://www.netflix.com/account",
    cancelSteps: ["Zaloguj się na netflix.com i otwórz „Konto”.", "Wybierz „Anuluj członkostwo” i potwierdź.", APP_STORE_NOTE],
  },
  {
    name: "Spotify Premium",
    category: "music",
    manageUrl: "https://www.spotify.com/account/subscription/",
    cancelSteps: ["Zaloguj się na spotify.com i przejdź do strony konta.", "W sekcji subskrypcji wybierz „Anuluj Premium”.", APP_STORE_NOTE],
  },
  {
    name: "YouTube Premium",
    category: "video",
    manageUrl: "https://www.youtube.com/paid_memberships",
    cancelSteps: ["Otwórz stronę płatnych subskrypcji YouTube.", "Wybierz „Dezaktywuj” przy YouTube Premium i potwierdź.", APP_STORE_NOTE],
  },
  {
    name: "ChatGPT Plus",
    category: "ai",
    manageUrl: "https://chatgpt.com/",
    cancelSteps: ["Zaloguj się w ChatGPT i otwórz ustawienia profilu.", "W sekcji konta lub subskrypcji wybierz zarządzanie planem i anuluj.", APP_STORE_NOTE],
  },
  {
    name: "Claude Pro",
    category: "ai",
    manageUrl: "https://claude.ai/settings/billing",
    cancelSteps: ["Zaloguj się na claude.ai i otwórz ustawienia płatności.", "Wybierz anulowanie planu i potwierdź.", APP_STORE_NOTE],
  },
  {
    name: "Disney+",
    category: "video",
    manageUrl: "https://www.disneyplus.com/account",
    cancelSteps: ["Zaloguj się na disneyplus.com i otwórz „Konto”.", "Wybierz swoją subskrypcję i „Anuluj subskrypcję”.", APP_STORE_NOTE],
  },
  {
    name: "HBO Max",
    category: "video",
    manageUrl: null,
    cancelSteps: ["Zaloguj się w serwisie i otwórz ustawienia konta.", "W sekcji subskrypcji wybierz anulowanie.", APP_STORE_NOTE],
  },
  {
    name: "Amazon Prime",
    category: "shopping",
    manageUrl: "https://www.amazon.pl/gp/primecentral",
    cancelSteps: ["Otwórz stronę zarządzania członkostwem Prime na amazon.pl.", "Wybierz zakończenie członkostwa i potwierdź."],
  },
  {
    name: "Apple (iCloud+, Music, TV+)",
    category: "cloud",
    manageUrl: "https://apps.apple.com/account/subscriptions",
    cancelSteps: ["Na iPhonie: Ustawienia → Twoje imię → Subskrypcje.", "Wybierz usługę i „Anuluj subskrypcję”."],
  },
  {
    name: "Google One",
    category: "cloud",
    manageUrl: "https://play.google.com/store/account/subscriptions",
    cancelSteps: ["Otwórz subskrypcje w Google Play.", "Wybierz Google One i „Anuluj subskrypcję”."],
  },
  {
    name: "Microsoft 365",
    category: "software",
    manageUrl: "https://account.microsoft.com/services",
    cancelSteps: ["Zaloguj się na konto Microsoft i otwórz „Usługi i subskrypcje”.", "Przy Microsoft 365 wybierz „Zarządzaj” i anuluj lub wyłącz cykliczne rozliczanie."],
  },
  {
    name: "Xbox Game Pass",
    category: "gaming",
    manageUrl: "https://account.microsoft.com/services",
    cancelSteps: ["Zaloguj się na konto Microsoft i otwórz „Usługi i subskrypcje”.", "Przy Game Pass wybierz „Zarządzaj” i anuluj."],
  },
  {
    name: "Adobe Creative Cloud",
    category: "software",
    manageUrl: "https://account.adobe.com/plans",
    cancelSteps: ["Zaloguj się na konto Adobe i otwórz „Plany”.", "Wybierz „Zarządzaj planem” → „Anuluj plan”.", "Sprawdź warunki — plany roczne płatne co miesiąc mogą mieć opłatę za wcześniejsze anulowanie."],
  },
  {
    name: "Dropbox",
    category: "cloud",
    manageUrl: "https://www.dropbox.com/account/plan",
    cancelSteps: ["Zaloguj się na dropbox.com i otwórz ustawienia planu.", "Wybierz anulowanie planu i potwierdź."],
  },
  {
    name: "Tidal",
    category: "music",
    manageUrl: null,
    cancelSteps: ["Zaloguj się na stronie konta Tidal.", "W sekcji subskrypcji wybierz anulowanie.", APP_STORE_NOTE],
  },
  {
    name: "Canva Pro",
    category: "software",
    manageUrl: null,
    cancelSteps: ["Zaloguj się w Canva i otwórz ustawienia płatności i planów.", "Wybierz anulowanie subskrypcji.", APP_STORE_NOTE],
  },
];

export const GENERIC_CANCEL_STEPS = [
  "Zaloguj się na oficjalnej stronie lub w aplikacji usługi.",
  "Otwórz ustawienia konta: zwykle sekcja „Subskrypcja”, „Plan” albo „Płatności”.",
  "Wybierz „Anuluj” lub wyłącz automatyczne odnawianie i potwierdź.",
  "Zachowaj e-mail z potwierdzeniem anulowania.",
  APP_STORE_NOTE,
];

export function findPopularService(name: string): PopularService | undefined {
  const normalized = name.trim().toLowerCase();
  return POPULAR_SERVICES.find((service) => service.name.toLowerCase() === normalized);
}
