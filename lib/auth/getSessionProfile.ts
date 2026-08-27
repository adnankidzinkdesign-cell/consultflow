import "server-only";
import { cache } from "react";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { getOrCreateProfile } from "@/lib/auth/getOrCreateProfile";
import { getKidzinkClaims, hasAppAccess } from "@/lib/auth/kidzink-auth-roles";
import type { AppRole } from "@/lib/supabase/types";

export interface SessionProfile {
  userId: string;
  email: string;
  fullName: string | null;
  role: AppRole;
  isActive: boolean;
}

/**
 * Fetches the signed-in user's auth identity and their `profiles` row in
 * one place. Returns `null` when there is no session, when the session has
 * no active profile (e.g. a deactivated account), OR when kidzink-auth
 * says this person's role(s) don't open the door to consultflow at all
 * (see /admin/apps there) — callers should treat all three cases the same
 * way: no access.
 *
 * This function plus each server action's own checks (lib/actions/*.ts)
 * ARE the actual authorization boundary now — not Row Level Security.
 * consultflow's own project can't resolve auth.uid() for a
 * kidzink-auth-issued session (see lib/supabase/server.ts's comment), so
 * every query issued through that client bypasses RLS entirely; nothing
 * enforces access except the checks written in code.
 *
 * Identity comes from kidzink-auth's separate Supabase project (see
 * lib/supabase/auth-server.ts), not consultflow's own — getOrCreateProfile
 * bridges that id/email to the `profiles` row in consultflow's own project.
 *
 * Wrapped in React's `cache()` so the ~13 call sites across the app (layout,
 * pages, and server actions) share one lookup per request instead of each
 * issuing its own. That's not just a perf nicety here: getOrCreateProfile's
 * one-time relink path re-keys a profile row's id, and duplicate concurrent
 * calls for the same request used to race that UPDATE against each other.
 */
export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  const authClient = await createAuthServerClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user || !user.email) return null;

  const claims = await getKidzinkClaims(authClient);
  if (!hasAppAccess(claims, "consultflow")) return null;

  const profile = await getOrCreateProfile(user.id, user.email);

  if (!profile || !profile.is_active) return null;

  return {
    userId: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    isActive: profile.is_active,
  };
});
