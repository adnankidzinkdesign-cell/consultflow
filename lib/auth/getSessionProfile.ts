import "server-only";
import { createClient } from "@/lib/supabase/server";
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
 * one place. Returns `null` when there is no session OR when the session
 * exists but has no active profile (e.g. a deactivated account) — callers
 * should treat both cases the same way: no access.
 *
 * This is a convenience/UX helper only. The actual authorization boundary
 * is Row Level Security — every query issued through lib/supabase/server.ts
 * is already scoped to what this user is allowed to see, independent of
 * whether a caller remembers to check `role` here.
 */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) return null;

  return {
    userId: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    isActive: profile.is_active,
  };
}
