"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Page views only, without query strings or record IDs from the panel. */
function anonymize(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url);
  return { ...event, url: `${url.origin}${url.pathname.replace(UUID, "[id]")}` };
}

/** Vercel Web Analytics: cookieless visit statistics, active only on Vercel deployments. */
export function SiteAnalytics() {
  return <Analytics beforeSend={anonymize} />;
}
