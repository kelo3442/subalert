import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "./database.types";

const PROTECTED_PREFIX = "/panel";
const AUTH_PAGES = ["/logowanie", "/rejestracja", "/zapomnialem-hasla"];

/** Refreshes the auth session cookie and guards the app routes. */
export async function updateSession(request: NextRequest) {
  const env = getSupabasePublicEnv();
  if (!env) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // Do not run code between createServerClient and getClaims(): it refreshes
  // the session and must see the same cookies.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  if (!isSignedIn && pathname.startsWith(PROTECTED_PREFIX)) {
    const next = encodeURIComponent(`${pathname}${search}`);
    return redirectTo(`/logowanie?next=${next}`);
  }

  if (isSignedIn && AUTH_PAGES.includes(pathname)) {
    return redirectTo("/panel");
  }

  return response;
}
