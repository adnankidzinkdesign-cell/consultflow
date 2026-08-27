import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Copied from kidzink-auth's lib/roles.ts (its reference implementation —
 * see that repo's README, "How a consuming app reads someone's roles").
 * There's no shared npm package for this yet, so this is a deliberate
 * copy, not an import — keep it in sync by hand if kidzink-auth's version
 * changes.
 *
 * Role codes and app access are embedded directly into the shared session
 * JWT by a Custom Access Token Auth Hook on kidzink-auth's own project
 * (supabase/migrations/0005_custom_access_token_hook.sql there), so this
 * reads them straight off the already-verified session — no extra network
 * or DB round trip, and no dependency on consultflow's own project
 * resolving auth.uid() for a kidzink-auth-issued session (it can't — see
 * lib/supabase/server.ts's comment).
 *
 * Caveat inherent to JWT claims: they're only as fresh as the session's
 * last sign-in/refresh (~1hr cycle). An admin revoking consultflow access
 * for someone via kidzink-auth's /admin/apps doesn't take effect for an
 * already-signed-in user until that next refresh.
 */

export type KidzinkClaims = {
  /** Role codes the signed-in user currently holds, e.g. ["staff", "pm"]. */
  roles: string[];
  /** App codes those roles open the door to, e.g. ["consultflow"]. */
  appAccess: string[];
};

const EMPTY_CLAIMS: KidzinkClaims = { roles: [], appAccess: [] };

/**
 * Reads the kidzink_roles/kidzink_app_access claims off the current
 * session's JWT, via the client pointed at kidzink-auth's own project
 * (lib/supabase/auth-server.ts) — NOT consultflow's own business-data
 * client, which never sees this session's JWT at all now.
 */
export async function getKidzinkClaims(
  supabase: SupabaseClient
): Promise<KidzinkClaims> {
  const { data, error } = await supabase.auth.getClaims();
  if (error) throw error;
  if (!data) return EMPTY_CLAIMS;

  const claims = data.claims as Record<string, unknown>;
  const roles = claims.kidzink_roles;
  const appAccess = claims.kidzink_app_access;

  return {
    roles: Array.isArray(roles) ? (roles as string[]) : [],
    appAccess: Array.isArray(appAccess) ? (appAccess as string[]) : [],
  };
}

/**
 * Whether `claims` (from getKidzinkClaims()) opens the door to `appCode`.
 * Coarse "let them in the door at all" check only — consultflow's own
 * `profiles.role` (admin/project_lead) still governs what they can see or
 * do once inside; this only answers "should they be inside consultflow at
 * all, per kidzink-auth's /admin/apps".
 */
export function hasAppAccess(claims: KidzinkClaims, appCode: string): boolean {
  return claims.appAccess.includes(appCode);
}
