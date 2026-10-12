const PLACEHOLDER_ORIGIN = "http://subalert.invalid";

/**
 * Returns an internal path to redirect to after login. Anything that could
 * leave the site (absolute URLs, "//evil.com", "/\\evil.com") falls back.
 */
export function safeRedirectPath(next: string | null | undefined, fallback = "/panel"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  if (/[\u0000-\u001f\\]/.test(next)) return fallback;
  try {
    const url = new URL(next, PLACEHOLDER_ORIGIN);
    if (url.origin !== PLACEHOLDER_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
