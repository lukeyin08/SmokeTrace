import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the OAuth / email-confirmation redirect from Supabase.
 * Exchanges the `code` for a session, then routes the user onward.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next) return NextResponse.redirect(`${origin}${next}`);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      let onboarded = false;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();
        onboarded = profile?.onboarding_completed ?? false;
      }
      return NextResponse.redirect(
        `${origin}${onboarded ? "/dashboard" : "/onboarding"}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
