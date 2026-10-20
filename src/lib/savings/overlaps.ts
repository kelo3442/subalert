import { BILL_CATEGORIES } from "@/lib/subscriptions/categories";
import type { Subscription } from "@/lib/subscriptions/types";

export type OverlapKind = "same" | "cloud" | "music" | "ai";

export interface Overlap {
  /** Stable id for dismissing; a new combination of plans shows up again. */
  key: string;
  kind: OverlapKind;
  subscriptions: Subscription[];
}

const GROUPS: { kind: Exclude<OverlapKind, "same">; pattern: RegExp }[] = [
  { kind: "cloud", pattern: /icloud|google one|dropbox|onedrive|microsoft 365|office 365|pcloud|\bmega\b/i },
  { kind: "music", pattern: /spotify|apple music|tidal|deezer|youtube (music|premium)|amazon music/i },
  { kind: "ai", pattern: /chatgpt|openai|claude|perplexity|copilot|midjourney/i },
];

// App store charges and bills of the same kind are usually different things (two apps, two policies).
const NOT_SAME = /app store|google play|^ubezpieczenie|^abonament|^rachunek|^czynsz/i;

function normalize(name: string) {
  return name.trim().toLocaleLowerCase("pl").replace(/\s+/g, " ");
}

const keyOf = (kind: OverlapKind, subscriptions: Subscription[]) =>
  `${kind}:${subscriptions
    .map((s) => s.id)
    .sort()
    .join(",")}`;

/** Active plans that seem to do the same job: the same service twice, or several clouds, music or AI plans. */
export function findOverlaps(subscriptions: Subscription[]): Overlap[] {
  const active = subscriptions.filter((s) => s.status === "active");
  const overlaps: Overlap[] = [];
  const grouped = new Set<string>();

  for (const { kind, pattern } of GROUPS) {
    const matches = active.filter((s) => pattern.test(s.name));
    if (matches.length >= 2) {
      overlaps.push({ key: keyOf(kind, matches), kind, subscriptions: matches });
      for (const s of matches) grouped.add(s.id);
    }
  }

  const byName = new Map<string, Subscription[]>();
  for (const s of active) {
    if (grouped.has(s.id) || NOT_SAME.test(s.name) || (s.category && BILL_CATEGORIES.includes(s.category))) continue;
    const name = normalize(s.name);
    byName.set(name, [...(byName.get(name) ?? []), s]);
  }
  for (const same of byName.values()) {
    if (same.length >= 2) overlaps.push({ key: keyOf("same", same), kind: "same", subscriptions: same });
  }
  return overlaps;
}

export function overlapTitle(overlap: Overlap): string {
  switch (overlap.kind) {
    case "same":
      return `${overlap.subscriptions[0].name} masz ${overlap.subscriptions.length} razy`;
    case "cloud":
      return "Płacisz za kilka chmur na pliki";
    case "music":
      return "Płacisz za kilka serwisów z muzyką";
    case "ai":
      return "Płacisz za kilka asystentów AI";
  }
}

export function overlapHint(overlap: Overlap): string {
  const youtube = overlap.subscriptions.some((s) => /youtube premium/i.test(s.name));
  switch (overlap.kind) {
    case "same":
      return "Może to drugie konto na inny e-mail albo usługa w pakiecie u operatora i osobno. Sprawdź, czy obie płatności są potrzebne.";
    case "cloud":
      return "Często wystarcza jedna. Sprawdź, gdzie naprawdę trzymasz zdjęcia i pliki, i czy ta druga nie jest pusta.";
    case "music":
      return youtube
        ? "YouTube Premium zawiera też YouTube Music. Sprawdź, czy słuchasz w obu miejscach."
        : "Zwykle słucha się w jednym miejscu. Sprawdź, z którego naprawdę korzystasz.";
    case "ai":
      return "Sprawdź, z którego korzystasz na co dzień. Pozostałe możesz włączać tylko na miesiąc, gdy są potrzebne.";
  }
}
