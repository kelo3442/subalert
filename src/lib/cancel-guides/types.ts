import type { ISODate } from "@/lib/dates";

/** Steps, notes and tips may contain links written as [label](url) or [label](/path). */
export interface CancelMethod {
  /** Where the subscription was bought, e.g. "W przeglądarce" or "Na iPhonie (App Store)". */
  title: string;
  steps: string[];
  note?: string;
}

export interface CancelGuide {
  slug: string;
  /** Page heading, e.g. "Jak anulować Netflix". */
  title: string;
  /** Who runs the service, as used in "sprawdzone z oficjalną pomocą …". */
  service: string;
  /** One or two sentences; also the page's meta description. */
  summary: string;
  methods: CancelMethod[];
  afterCancel: string[];
  tips: string[];
  sources: { label: string; url: string }[];
  /** When the steps were last checked against the official help pages. */
  verifiedAt: ISODate;
}
