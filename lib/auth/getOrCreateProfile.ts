import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Replaces the old `handle_new_user` trigger (see
 * supabase/migrations/0009_decouple_profiles_from_auth.sql) now that
 * identity comes from kidzink-auth's separate Supabase project instead of
 * an insert into consultflow's own `auth.users`. Called from
 * getSessionProfile() on every request, so it has to be cheap: one lookup
 * by id in the common case.
 *
 * Uses the service-role admin client (bypasses RLS) rather than a new RLS
 * insert policy — same rationale lib/supabase/admin.ts already documents
 * for the trigger's server-side equivalent.
 */
export async function getOrCreateProfile(
  userId: string,
  email: string
): Promise<ProfileRow | null> {
  const admin = createAdminClient();

  const { data: byId, error: byIdError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (byIdError) throw byIdError;
  if (byId) return byId;

  // Not found by id — check for a row from before the kidzink-auth switch
  // (or from a re-invite under a new kidzink-auth user id), matched by
  // email, and re-key it rather than creating a duplicate.
  const { data: byEmail, error: byEmailError } = await admin
    .from("profiles")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  if (byEmailError) throw byEmailError;

  if (byEmail) {
    const { data: relinked, error: relinkError } = await admin
      .from("profiles")
      .update({ id: userId })
      .eq("id", byEmail.id)
      .select("*")
      .maybeSingle();

    if (relinkError) throw relinkError;
    if (relinked) return relinked;

    // 0 rows updated: a concurrent request (e.g. two tabs signing in at
    // once) already relinked this row to `userId` between our lookup above
    // and this UPDATE. getSessionProfile() memoizes per request via
    // React's cache(), so this only guards the cross-request case — refetch
    // by the id that update would have landed on.
    const { data: alreadyRelinked, error: refetchError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (refetchError) throw refetchError;
    return alreadyRelinked;
  }

  const { data: created, error: createError } = await admin
    .from("profiles")
    .insert({ id: userId, email })
    .select("*")
    .single();

  if (createError) throw createError;
  return created;
}
