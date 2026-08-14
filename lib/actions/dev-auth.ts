"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface DevAuthState {
  error: string | null;
}

const isDevEnvironment = process.env.NODE_ENV !== "production";

/**
 * Local-only email/password sign-in/sign-up, so ConsultFlow can be tested
 * end-to-end before an Entra ID app registration is approved.
 *
 * This is NOT a bypass of Supabase Auth or Row Level Security — it
 * establishes a real Supabase session via the built-in email/password
 * provider, so every RLS policy and role check behaves exactly as it will
 * with Microsoft SSO. Sign up once, then promote yourself to admin the
 * same way the README describes for the real flow; this doesn't skip that.
 *
 * Gated on NODE_ENV so it can never run against a deployed (production)
 * build — `next build` always sets NODE_ENV=production, which is also why
 * the login page only renders the dev section when this is true. This
 * action re-checks it independently in case that UI gate were ever
 * bypassed, so a direct request against a deployed instance still fails.
 */
export async function devAuth(
  _prevState: DevAuthState,
  formData: FormData
): Promise<DevAuthState> {
  if (!isDevEnvironment) {
    return { error: "Dev sign-in is disabled in this environment." };
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
