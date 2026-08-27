import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Secret-key Supabase client (Supabase's current name for what used to be
 * called the "service_role" key). Bypasses Row Level Security entirely.
 *
 * SECURITY: this file must never be imported by anything that could end up
 * in a client bundle — the `server-only` import above makes any accidental
 * client-side import fail the build.
 *
 * This used to be reserved for a short list of operations that must
 * legitimately bypass RLS (signed URLs, the auth trigger's server-side
 * equivalent) — everything else went through lib/supabase/server.ts's own
 * RLS-scoped client instead. That client no longer works: consultflow's
 * project can't resolve auth.uid() for a kidzink-auth-issued session (see
 * lib/supabase/server.ts's comment, and kidzink-auth's README
 * "Cross-project auth.uid() doesn't resolve"). lib/supabase/server.ts is
 * now a thin alias for this client, which means most of the app reaches
 * this file indirectly — every one of those call sites is now responsible
 * for checking authorization itself in code, since Postgres no longer will.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY env vars."
    );
  }

  return createSupabaseClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
