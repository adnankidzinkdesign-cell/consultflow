"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isEmailLoginEnabled } from "@/lib/auth/emailLoginEnabled";

export interface DevAuthState {
  error: string | null;
}

/**
 * Email/password sign-in/sign-up. Normally local-only (see
 * isEmailLoginEnabled), so ConsultFlow can be tested end-to-end before an
 * Entra ID app registration is approved, or temporarily enabled in
 * production via ENABLE_EMAIL_LOGIN for non-org reviewers.
 *
 * This is NOT a bypass of Supabase Auth or Row Level Security — it
 * establishes a real Supabase session via the built-in email/password
 * provider, so every RLS policy and role check behaves exactly as it will
 * with Microsoft SSO. Sign up once, then promote yourself to admin the
 * same way the README describes for the real flow; this doesn't skip that.
 * Note it also bypasses the ALLOWED_EMAIL_DOMAIN check (that check only
 * runs in the OAuth callback), so this is intentionally the path for
 * non-kidzink.com accounts.
 *
 * The login page only renders the email form when isEmailLoginEnabled()
 * is true; this action re-checks it independently so a direct request
 * against a deployed instance still fails once that's the case.
 */
export async function devAuth(
  _prevState: DevAuthState,
  formData: FormData
): Promise<DevAuthState> {
  if (!isEmailLoginEnabled()) {
    return { error: "Email sign-in is disabled in this environment." };
  }

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const intent = formData.get("intent") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data, error } =
    intent === "sign_up"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      error:
        "Signed up, but no session was returned — email confirmation is probably still required. Disable \"Confirm email\" in Supabase Auth settings (see README) and try again.",
    };
  }

  redirect("/consultants");
}
