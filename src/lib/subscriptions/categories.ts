export const CATEGORY_KEYS = [
  "video",
  "music",
  "ai",
  "software",
  "cloud",
  "gaming",
  "news",
  "education",
  "fitness",
  "shopping",
  "utilities",
  "housing",
  "telecom",
  "insurance",
  "other",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  video: "Wideo i TV",
  music: "Muzyka i audio",
  ai: "Narzędzia AI",
  software: "Oprogramowanie",
  cloud: "Chmura i pliki",
  gaming: "Gry",
  news: "Prasa i książki",
  education: "Edukacja",
  fitness: "Zdrowie i sport",
  shopping: "Zakupy i dostawy",
  utilities: "Prąd, gaz, woda",
  housing: "Mieszkanie i czynsz",
  telecom: "Telefon i internet",
  insurance: "Ubezpieczenia",
  other: "Inne",
};

export function isCategoryKey(value: string): value is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(value);
}

/** Household bills — shown as a separate group in quick start and on the landing page. */
export const BILL_CATEGORIES: readonly CategoryKey[] = ["utilities", "housing", "telecom", "insurance"];
