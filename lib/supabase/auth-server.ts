import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { authCookieOptions } from "@/lib/supabase/auth-cookie-options";

/**
 * Per-request client for kidzink-auth's Supabase project — identity only.
 * Use this to read who's signed in (auth.getUser()) or to sign out; use
 * lib/supabase/server.ts for everything that queries consultflow's own
 * business data. Cookies are scoped via NEXT_PUBLIC_COOKIE_DOMAIN (see
 * auth-cookie-options.ts) so the session is the same one kidzink-auth (and
 * every other *.kidzink.com app) reads.
 */
export async function createAuthServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: authCookieOptions(),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if middleware is refreshing sessions.
          }
        },
      },
    }
  );
}
