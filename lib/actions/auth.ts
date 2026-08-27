"use server";

import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

/**
 * Signs out of the shared kidzink-auth session (clearing it for every
 * *.kidzink.com app, not just this one) and sends the browser to
 * kidzink-auth's own /login — consultflow no longer runs its own sign-in
 * flow, see lib/supabase/middleware.ts.
 */
export async function signOut() {
  const supabase = await createAuthServerClient();
  await supabase.auth.signOut();
  redirect(`${process.env.NEXT_PUBLIC_KIDZINK_AUTH_URL}/login`);
}
