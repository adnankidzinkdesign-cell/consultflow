import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Per-request Supabase client for use in Server Components, Server Actions,
 * and Route Handlers — this is the client almost everything in the app
 * should use for consultflow's own business data.
 *
 * This used to forward kidzink-auth's shared-session access token as the
 * Authorization bearer and rely on Row Level Security to resolve
 * auth.uid() from it, on the assumption that consultflow's own project
 * could be configured (Authentication → Third-Party Auth → Custom OIDC)
 * to trust JWTs signed by kidzink-auth's separate project. That
 * assumption was wrong: Supabase's Third-Party Auth only supports five
 * named vendors (Clerk, Auth0, Firebase Auth, AWS Cognito, WorkOS) — there
 * is no supported way to point it at another Supabase project. Every
 * query through the old version of this client was silently failing RLS
 * and falling back to empty results (see kidzink-auth's README,
 * "Cross-project auth.uid() doesn't resolve", for the full story).
 *
 * So this is now a thin alias for the service-role client
 * (lib/supabase/admin.ts) — it bypasses RLS entirely. That makes every
 * call site responsible for its own authorization check, in code, in
 * place of what the RLS policies in supabase/migrations/0002_rls.sql
 * (and 0003/0005) used to provide automatically:
 *   - lib/actions/*.ts's mutations already do this — most were written
 *     defensively alongside RLS from the start ("RLS enforces this
 *     server-side ... but we also check here"), so they needed no change.
 *   - Read access to a *specific app* (as opposed to a specific row) is
 *     covered by getSessionProfile(), which now also checks
 *     hasAppAccess() — see lib/auth/kidzink-auth-roles.ts.
 * Any NEW query against a table with a non-trivial RLS policy needs an
 * equivalent check added at the call site — Postgres will no longer catch
 * a missing one.
 */
export async function createClient() {
  return createAdminClient();
}
