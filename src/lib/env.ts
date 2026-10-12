export interface SupabasePublicEnv {
  url: string;
  publishableKey: string;
}

/**
 * Public Supabase settings. Returns null when the project is not configured,
 * so the app can show setup instructions instead of a fake login.
 */
export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!configured) return "http://localhost:3000";
  const withProtocol = configured.startsWith("http") ? configured : `https://${configured}`;
  return withProtocol.replace(/\/$/, "");
}

/** Show "Sign in with Google" only once the provider is enabled in Supabase. */
export function isGoogleAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
}
