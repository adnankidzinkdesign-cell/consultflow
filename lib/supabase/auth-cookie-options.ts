import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * The whole point of kidzink-auth is that the session cookie it sets is
 * readable by every app under kidzink.com, not just kidzink-auth itself —
 * so in any real deployment NEXT_PUBLIC_COOKIE_DOMAIN must be set to
 * ".kidzink.com" (leading dot = matches all subdomains), same value as
 * kidzink-auth's own lib/supabase/cookie-options.ts. Left unset in local
 * dev, where the browser's default host-only cookie behavior already
 * matches localhost regardless of port.
 *
 * NEXT_PUBLIC_-prefixed because lib/supabase/auth-client.ts runs in the
 * browser bundle, where only NEXT_PUBLIC_ vars get inlined at build time.
 */
export function authCookieOptions(): CookieOptionsWithName {
  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  return domain ? { domain } : {};
}
