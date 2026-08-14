import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback for Microsoft 365 (Azure/Entra ID) sign-in.
 *
 * Tenant restriction is enforced twice:
 *   1. IdP-level — the Entra ID app registration is single-tenant, and the
 *      Supabase Azure provider's `url` is scoped to that tenant
 *      (supabase/config.toml), so only org accounts can complete the OAuth
 *      handshake at all.
 *   2. App-level — the check below confirms the signed-in email is on the
 *      allowed domain before a session is considered valid, in case #1 is
 *      ever misconfigured. On failure we explicitly sign the user back out
 *      so no session is left half-established.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/consultants";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN?.toLowerCase();
  const email = data.user.email?.toLowerCase();
  const emailDomain = email?.split("@")[1];

  if (allowedDomain && emailDomain !== allowedDomain) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=domain`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_active")
    .eq("id", data.user.id)
    .single();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=no_profile`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
