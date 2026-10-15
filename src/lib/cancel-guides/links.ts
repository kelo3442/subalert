export type InlinePart = { text: string } | { text: string; href: string };

const LINK = /\[([^\]]+)\]\(((?:https:\/\/|\/)[^)\s]+)\)/g;

/** Splits "Open [settings](https://…) now" into text and link parts. */
export function parseInlineLinks(value: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const match of value.matchAll(LINK)) {
    if (match.index > last) parts.push({ text: value.slice(last, match.index) });
    parts.push({ text: match[1], href: match[2] });
    last = match.index + match[0].length;
  }
  if (last < value.length) parts.push({ text: value.slice(last) });
  return parts;
}
