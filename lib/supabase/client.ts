import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

/**
 * Browser-side Supabase client. Only use this for client-side reactivity
 * (e.g. upload progress, optimistic UI) — it still runs under the signed-in
 * user's RLS-scoped session, never elevated. All data mutations should go
 * through Server Actions (see lib/actions/*) rather than calling this
 * client directly for writes.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
