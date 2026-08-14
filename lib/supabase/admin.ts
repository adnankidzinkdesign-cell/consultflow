import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Secret-key Supabase client (Supabase's current name for what used to be
 * called the "service_role" key). Bypasses Row Level Security entirely.
 *
 * SECURITY: this file must never be imported by anything that could end up
 * in a client bundle — the `server-only` import above makes any accidental
 * client-side import fail the build. Use this client ONLY for operations
 * that must legitimately bypass RLS:
 *   - generating short-lived signed URLs for private Storage objects
 *   - the auth `handle_new_user` trigger's equivalent server-side needs
 *
 * Never use this client to "work around" an RLS policy on a path reachable
 * by a non-admin request — if a mutation needs elevated access, that's a
 * sign the RLS policy design needs revisiting, not a reason to reach for
 * this client.
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
