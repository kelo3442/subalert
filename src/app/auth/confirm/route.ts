import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { confirmFailureNotice } from "@/lib/auth-confirm";
import { isSupabaseConfigured } from "@/lib/env";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/** Landing point of the e-mail confirmation link sent by Supabase Auth. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeRedirectPath(searchParams.get("next"));
  const code = searchParams.get("code");
  const notice = confirmFailureNotice({ hadCode: Boolean(code), errorCode: searchParams.get("error_code"), next });
  const failure = NextResponse.redirect(new URL(`/logowanie?blad=${notice}`, request.url));
  if (!isSupabaseConfigured()) return failure;

  const supabase = await createSupabaseServerClient();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Users signing in for the first time (e.g. with Google) start with onboarding.
      let destination = next;
      if (next === "/panel" && data.user) {
        const { count } = await supabase
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", data.user.id);
        if (count === 0) destination = "/panel/start";
      }
      return NextResponse.redirect(new URL(destination, request.url));
    }
  } else if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  return failure;
}
