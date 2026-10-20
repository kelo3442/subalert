import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { CANCEL_GUIDES } from "@/lib/cancel-guides/data";
import { LEGAL_EFFECTIVE_DATE } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/sprawdz`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/jak-anulowac`, changeFrequency: "monthly", priority: 0.8 },
    ...CANCEL_GUIDES.map((guide) => ({
      url: `${base}/jak-anulowac/${guide.slug}`,
      lastModified: guide.verifiedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${base}/rejestracja`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/logowanie`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/regulamin`, lastModified: LEGAL_EFFECTIVE_DATE, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/prywatnosc`, lastModified: LEGAL_EFFECTIVE_DATE, changeFrequency: "yearly", priority: 0.2 },
  ];
}
