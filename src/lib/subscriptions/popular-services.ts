import type { CategoryKey } from "./categories";

export interface PopularService {
  name: string;
  category: CategoryKey;
  /** Official account / subscription page. Providers change these, so users can edit it. */
  manageUrl: string | null;
  /** Provider-specific hints; generic steps are shown when missing. */
  cancelSteps?: string[];
  /** Shown as a quick-pick chip in the single subscription form. */
  featured?: boolean;
}

/** How each service usually appears in bank transaction descriptions. */
const BANK_PATTERNS: Record<string, RegExp> = {
  Netflix: /netflix/,
  "Spotify Premium": /spotify/,
  "YouTube Premium": /youtube/,
  "ChatGPT Plus": /openai|chatgpt/,
  "Claude Pro": /anthropic|claude\.ai/,
  "Disney+": /disney/,
  "HBO Max": /hbo ?max|hbomax/,
  "Amazon Prime": /amazon ?prime|prime ?video|amzn.{0,20}prime/,
  "Apple (iCloud+, Music, TV+)": /apple\.com|itunes/,
  "Google One": /google ?one|google ?storage/,
  "Microsoft 365": /microsoft ?365|office ?365/,
  "Xbox Game Pass": /xbox/,
  "Adobe Creative Cloud": /adobe/,
  Dropbox: /dropbox/,
  Tidal: /tidal/,
  "Canva Pro": /canva/,
  "PlayStation Plus": /playstation|sony interactive/,
  "Discord Nitro": /discord/,
  "Canal+ Online": /canal ?\+|canal ?plus/,
  Player: /player\.pl/,
  SkyShowtime: /skyshowtime/,
  Audioteka: /audioteka/,
  Storytel: /storytel/,
  Legimi: /legimi/,
  "Empik Go": /empik ?go/,
  "Allegro Smart!": /allegro ?smart/,
  "Duolingo Super": /duolingo/,
  Midjourney: /midjourney/,
  // Household bills: common Polish providers.
  Prąd: /\bpge\b|tauron|\benea\b|energa|e\.on|innogy|stoen/,
  Gaz: /pgnig|polskie g[oó]rnictwo naftowe|psg sp/,
  "Woda i ścieki": /mpwik|wodoci[aą]g|aquanet|wodkan|zwik/,
  "Internet domowy": /\bupc\b|vectra|netia|\binea\b|toya|multimedia polska/,
  "Abonament telefoniczny": /\borange\b|\bplay\b|p4 sp|\bplus\b|polkomtel|t-mobile|heyah|nju mobile/,
  "Telewizja kablowa / satelitarna": /canal\+ polska|polsat box|cyfrowy polsat/,
  "Ubezpieczenie samochodu (OC/AC)": /\bpzu\b|warta|allianz|ergo hestia|link4|generali|uniqa|compensa|proama|\baviva\b/,
};

const APP_STORE_NOTE =
  "Jeśli płacisz przez App Store lub Google Play, anulujesz w ustawieniach subskrypcji sklepu, a nie w samej usłudze.";

export const POPULAR_SERVICES: PopularService[] = [
  {
    featured: true,
    name: "Netflix",
    category: "video",
    manageUrl: "https://www.netflix.com/account",
    cancelSteps: ["Zaloguj się na netflix.com i otwórz „Konto”.", "Wybierz „Anuluj członkostwo” i potwierdź.", APP_STORE_NOTE],
  },
  {
    featured: true,
    name: "Spotify Premium",
    category: "music",
    manageUrl: "https://www.spotify.com/account/subscription/",
    cancelSteps: ["Zaloguj się na spotify.com i przejdź do strony konta.", "W sekcji subskrypcji wybierz „Anuluj Premium”.", APP_STORE_NOTE],
  },
  {
    featured: true,
    name: "YouTube Premium",
    category: "video",
    manageUrl: "https://www.youtube.com/paid_memberships",
    cancelSteps: ["Otwórz stronę płatnych subskrypcji YouTube.", "Wybierz „Dezaktywuj” przy YouTube Premium i potwierdź.", APP_STORE_NOTE],
  },
  {
    featured: true,
    name: "ChatGPT Plus",
    category: "ai",
    manageUrl: "https://chatgpt.com/",
    cancelSteps: ["Zaloguj się w ChatGPT i otwórz ustawienia profilu.", "W sekcji konta lub subskrypcji wybierz zarządzanie planem i anuluj.", APP_STORE_NOTE],
  },
  {
    featured: true,
    name: "Claude Pro",
    category: "ai",
    manageUrl: "https://claude.ai/settings/billing",
    cancelSteps: ["Zaloguj się na claude.ai i otwórz ustawienia płatności.", "Wybierz anulowanie planu i potwierdź.", APP_STORE_NOTE],
  },
  {
    featured: true,
    name: "Disney+",
    category: "video",
    manageUrl: "https://www.disneyplus.com/account",
    cancelSteps: ["Zaloguj się na disneyplus.com i otwórz „Konto”.", "Wybierz swoją subskrypcję i „Anuluj subskrypcję”.", APP_STORE_NOTE],
  },
  {
    featured: true,
    name: "HBO Max",
    category: "video",
    manageUrl: null,
    cancelSteps: ["Zaloguj się w serwisie i otwórz ustawienia konta.", "W sekcji subskrypcji wybierz anulowanie.", APP_STORE_NOTE],
  },
  {
    featured: true,
    name: "Amazon Prime",
    category: "shopping",
    manageUrl: "https://www.amazon.pl/gp/primecentral",
    cancelSteps: ["Otwórz stronę zarządzania członkostwem Prime na amazon.pl.", "Wybierz zakończenie członkostwa i potwierdź."],
  },
  {
    featured: true,
    name: "Apple (iCloud+, Music, TV+)",
    category: "cloud",
    manageUrl: "https://apps.apple.com/account/subscriptions",
    cancelSteps: ["Na iPhonie: Ustawienia → Twoje imię → Subskrypcje.", "Wybierz usługę i „Anuluj subskrypcję”."],
  },
  {
    featured: true,
    name: "Google One",
    category: "cloud",
    manageUrl: "https://play.google.com/store/account/subscriptions",
    cancelSteps: ["Otwórz subskrypcje w Google Play.", "Wybierz Google One i „Anuluj subskrypcję”."],
  },
  {
    featured: true,
    name: "Microsoft 365",
    category: "software",
    manageUrl: "https://account.microsoft.com/services",
    cancelSteps: ["Zaloguj się na konto Microsoft i otwórz „Usługi i subskrypcje”.", "Przy Microsoft 365 wybierz „Zarządzaj” i anuluj lub wyłącz cykliczne rozliczanie."],
  },
  {
    featured: true,
    name: "Xbox Game Pass",
    category: "gaming",
    manageUrl: "https://account.microsoft.com/services",
    cancelSteps: ["Zaloguj się na konto Microsoft i otwórz „Usługi i subskrypcje”.", "Przy Game Pass wybierz „Zarządzaj” i anuluj."],
  },
  {
    featured: true,
    name: "Adobe Creative Cloud",
    category: "software",
    manageUrl: "https://account.adobe.com/plans",
    cancelSteps: ["Zaloguj się na konto Adobe i otwórz „Plany”.", "Wybierz „Zarządzaj planem” → „Anuluj plan”.", "Sprawdź warunki — plany roczne płatne co miesiąc mogą mieć opłatę za wcześniejsze anulowanie."],
  },
  {
    featured: true,
    name: "Dropbox",
    category: "cloud",
    manageUrl: "https://www.dropbox.com/account/plan",
    cancelSteps: ["Zaloguj się na dropbox.com i otwórz ustawienia planu.", "Wybierz anulowanie planu i potwierdź."],
  },
  {
    featured: true,
    name: "Tidal",
    category: "music",
    manageUrl: null,
    cancelSteps: ["Zaloguj się na stronie konta Tidal.", "W sekcji subskrypcji wybierz anulowanie.", APP_STORE_NOTE],
  },
  {
    featured: true,
    name: "Canva Pro",
    category: "software",
    manageUrl: null,
    cancelSteps: ["Zaloguj się w Canva i otwórz ustawienia płatności i planów.", "Wybierz anulowanie subskrypcji.", APP_STORE_NOTE],
  },
  { name: "PlayStation Plus", category: "gaming", manageUrl: null },
  { name: "Discord Nitro", category: "gaming", manageUrl: null },
  { name: "Canal+ Online", category: "video", manageUrl: null },
  { name: "Player", category: "video", manageUrl: null },
  { name: "SkyShowtime", category: "video", manageUrl: null },
  { name: "Audioteka", category: "news", manageUrl: null },
  { name: "Storytel", category: "news", manageUrl: null },
  { name: "Legimi", category: "news", manageUrl: null },
  { name: "Empik Go", category: "news", manageUrl: null },
  { name: "Allegro Smart!", category: "shopping", manageUrl: null },
  { name: "Duolingo Super", category: "education", manageUrl: null },
  { name: "Midjourney", category: "ai", manageUrl: null },
  { name: "Siłownia / karta sportowa", category: "fitness", manageUrl: null },
  { name: "Prąd", category: "utilities", manageUrl: null },
  { name: "Gaz", category: "utilities", manageUrl: null },
  { name: "Woda i ścieki", category: "utilities", manageUrl: null },
  { name: "Ogrzewanie", category: "utilities", manageUrl: null },
  { name: "Wywóz śmieci", category: "utilities", manageUrl: null },
  { name: "Czynsz / opłaty administracyjne", category: "housing", manageUrl: null },
  { name: "Rata kredytu", category: "housing", manageUrl: null },
  { name: "Abonament telefoniczny", category: "telecom", manageUrl: null },
  { name: "Internet domowy", category: "telecom", manageUrl: null },
  { name: "Telewizja kablowa / satelitarna", category: "telecom", manageUrl: null },
  { name: "Abonament RTV", category: "telecom", manageUrl: null },
  { name: "Ubezpieczenie samochodu (OC/AC)", category: "insurance", manageUrl: null },
  { name: "Ubezpieczenie mieszkania", category: "insurance", manageUrl: null },
  { name: "Ubezpieczenie na życie", category: "insurance", manageUrl: null },
];

export const FEATURED_SERVICES = POPULAR_SERVICES.filter((service) => service.featured);

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

/** Recognises a known service in a bank transaction description. */
export function matchServiceInDescription(description: string): PopularService | undefined {
  const text = description.toLocaleLowerCase("pl");
  const name = Object.keys(BANK_PATTERNS).find((key) => BANK_PATTERNS[key].test(text));
  return name ? POPULAR_SERVICES.find((service) => service.name === name) : undefined;
}
