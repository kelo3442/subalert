import type { Subscription } from "@/lib/subscriptions/types";

/**
 * Cheaper ways to pay for the same service, from the providers' official
 * Polish price pages (checked on `verifiedAt`). A tip shows only when the
 * user's amount equals the listed monthly price, so it is clearly that plan.
 */
export interface CheaperOffer {
  id: string;
  service: RegExp;
  /** The plan the user is on, as listed by the provider (monthly). */
  monthlyCents: number;
  title: string;
  body: string;
  /** Yearly saving if the user switches; null when it depends on the person (e.g. student). */
  yearlySavingCents: number | null;
  source: string;
  verifiedAt: string;
}

export const CHEAPER_OFFERS: CheaperOffer[] = [
  {
    id: "disney-premium-yearly",
    service: /disney/i,
    monthlyCents: 5999,
    title: "Disney+ Premium taniej w planie rocznym",
    body: "Disney+ podaje cenę Premium 59,99 zł miesięcznie albo 599,90 zł za rok. Płacąc rocznie, wydasz mniej, jeśli i tak oglądasz cały rok.",
    yearlySavingCents: 5999 * 12 - 59990,
    source: "https://www.disneyplus.com/pl-pl",
    verifiedAt: "2026-10-20",
  },
  {
    id: "disney-standard-yearly",
    service: /disney/i,
    monthlyCents: 3499,
    title: "Disney+ Standard taniej w planie rocznym",
    body: "Disney+ podaje cenę Standard 34,99 zł miesięcznie albo 349,90 zł za rok. Płacąc rocznie, wydasz mniej, jeśli i tak oglądasz cały rok.",
    yearlySavingCents: 3499 * 12 - 34990,
    source: "https://www.disneyplus.com/pl-pl",
    verifiedAt: "2026-10-20",
  },
  {
    id: "spotify-individual-shared",
    service: /spotify/i,
    monthlyCents: 2699,
    title: "Spotify taniej we dwoje, w rodzinie albo na studiach",
    body: "Spotify podaje: Premium Individual 26,99 zł, Duo 36,99 zł za 2 konta (para pod jednym adresem), Family 45,99 zł do 6 kont (rodzina pod jednym adresem), Student 14,49 zł dla studentów zatwierdzonych uczelni. Jeśli ktoś w domu też płaci za Spotify, wspólny plan wyjdzie taniej.",
    yearlySavingCents: null,
    source: "https://www.spotify.com/pl/premium/",
    verifiedAt: "2026-10-20",
  },
];

export interface CheaperTip {
  key: string;
  offer: CheaperOffer;
  subscription: Subscription;
}

export function cheaperOffers(subscriptions: Subscription[]): CheaperTip[] {
  const tips: CheaperTip[] = [];
  for (const subscription of subscriptions) {
    if (subscription.status !== "active" || subscription.billingCycle !== "monthly") continue;
    const offer = CHEAPER_OFFERS.find((o) => o.service.test(subscription.name) && o.monthlyCents === subscription.amountCents);
    if (offer) tips.push({ key: `cheaper:${subscription.id},${offer.id}`, offer, subscription });
  }
  return tips;
}

const OC = /\boc\b|ubezpieczenie (samochodu|auta|pojazdu|komunikacyjne)|\boc\/ac\b/i;

/** Car third-party insurance (OC): renews itself for another 12 months unless the owner gives notice. */
export function isCarInsurance(subscription: Subscription): boolean {
  return OC.test(subscription.name);
}
