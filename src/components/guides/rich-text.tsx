import Link from "next/link";
import { parseInlineLinks } from "@/lib/cancel-guides/links";

/** Renders guide text with its [label](url) links. */
export function RichText({ value }: { value: string }) {
  return (
    <>
      {parseInlineLinks(value).map((part, index) =>
        "href" in part ? (
          part.href.startsWith("/") ? (
            <Link key={index} href={part.href} className="text-accent underline-offset-2 hover:underline">
              {part.text}
            </Link>
          ) : (
            <a key={index} href={part.href} target="_blank" rel="noopener noreferrer" className="text-accent underline-offset-2 hover:underline">
              {part.text}
            </a>
          )
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}
