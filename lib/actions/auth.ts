"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Kicks off the Microsoft 365 (Azure/Entra ID) OAuth sign-in flow. Supabase
 * returns a provider authorization URL rather than establishing a session
 * directly — we redirect the browser there, and Microsoft redirects back to
 * /auth/callback once the user signs in.
 */
export async function signInWithAzure(formData: FormData) {
  const next = (formData.get("next") as string | null) ?? "/consultants";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: "openid profile email",
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "oauth_failed")}`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
