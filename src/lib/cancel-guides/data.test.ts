import { describe, expect, it } from "vitest";
import { CANCEL_GUIDES } from "./data";
import { parseInlineLinks } from "./links";

const allText = (guide: (typeof CANCEL_GUIDES)[number]) => [
  ...guide.methods.flatMap((m) => [...m.steps, m.note ?? ""]),
  ...guide.afterCancel,
  ...guide.tips,
];

describe("cancel guides", () => {
  it("have unique URL-safe slugs and complete content", () => {
    const slugs = CANCEL_GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const guide of CANCEL_GUIDES) {
      expect(guide.slug).toMatch(/^[a-z0-9-]+$/);
      expect(guide.title.startsWith("Jak anulować")).toBe(true);
      expect(guide.methods.length).toBeGreaterThan(0);
      expect(guide.sources.length).toBeGreaterThan(0);
      expect(guide.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const source of guide.sources) expect(source.url).toMatch(/^https:\/\//);
    }
  });

  it("only links to https pages or to other guides that exist", () => {
    for (const guide of CANCEL_GUIDES) {
      for (const text of allText(guide)) {
        expect(text).not.toMatch(/\]\((?!https:\/\/|\/)/);
        for (const part of parseInlineLinks(text)) {
          if (!("href" in part) || part.href.startsWith("https://")) continue;
          const slug = part.href.replace(/^\/jak-anulowac\//, "");
          expect(CANCEL_GUIDES.some((g) => g.slug === slug), `${guide.slug} → ${part.href}`).toBe(true);
        }
      }
    }
  });

  it("parses inline links", () => {
    expect(parseInlineLinks("Wejdź na [stronę](https://x.pl/a) i kliknij.")).toEqual([
      { text: "Wejdź na " },
      { text: "stronę", href: "https://x.pl/a" },
      { text: " i kliknij." },
    ]);
    expect(parseInlineLinks("Bez linków")).toEqual([{ text: "Bez linków" }]);
  });
});
