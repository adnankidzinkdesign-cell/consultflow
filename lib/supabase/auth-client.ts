import { createBrowserClient } from "@supabase/ssr";
import { authCookieOptions } from "@/lib/supabase/auth-cookie-options";

/**
 * Browser-side client for kidzink-auth's Supabase project — identity only.
 * Separate from lib/supabase/client.ts, which points at consultflow's own
 * project for business data. Not currently used by any page (every auth
 * check here runs server-side) — kept for the rare case a client component
 * needs to read the current shared session directly.
 */
export function createAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_PUBLISHABLE_KEY!,
    { cookieOptions: authCookieOptions() }
  );
}
