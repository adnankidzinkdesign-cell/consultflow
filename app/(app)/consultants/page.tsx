import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import { Button } from "@kidzink/ui";
import { ConsultantsBrowser } from "@/components/consultflow/consultants-browser";
import { ConsultantMetrics } from "@/components/consultflow/consultant-metrics";
import { getAllConsultantProjectNames } from "@/lib/queries/consultant-projects";
import {
  getConsultantRatings,
  getBlacklistedConsultantIds,
  getBlacklistedDisciplinesByConsultant,
} from "@/lib/queries/consultant-ratings";

/**
 * Filtering used to be server-side (search params -> a re-filtered Supabase
 * query -> full page navigation), but with ~40 consultants that made every
 * filter change wait on a round trip for no real benefit — the whole list
 * fits in memory comfortably. So this page just fetches everything once and
 * hands it to ConsultantsBrowser (a Client Component) to filter instantly
 * in the browser. Trade-off: filters no longer live in the URL, so they
 * don't survive a refresh or a shared link — acceptable for an internal
 * tool at this scale.
 */
export default async function ConsultantsPage() {
  const [profile, supabase] = await Promise.all([
    getSessionProfile(),
    createClient(),
  ]);

  const [
    { data: consultants, error: consultantsError },
    projectNamesByConsultant,
    ratingsByConsultant,
    blacklistedIds,
    blacklistedDisciplinesByConsultant,
  ] = await Promise.all([
    supabase.from("consultants").select("*").order("company_name"),
    getAllConsultantProjectNames(supabase),
    getConsultantRatings(supabase),
    getBlacklistedConsultantIds(supabase),
    getBlacklistedDisciplinesByConsultant(supabase),
  ]);

  // Was silently falling back to an empty list on any query error (e.g. RLS
  // rejecting the request because consultflow's project doesn't yet trust
  // kidzink-auth's JWT — see lib/supabase/server.ts's Third-Party Auth
  // comment) — that read as "the list is just empty", not "something is
  // broken". Throw instead so the real error surfaces.
  if (consultantsError) throw consultantsError;

  const all = consultants ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-xs font-bold text-foreground">Consultants</h1>
          <p className="text-sm text-muted-foreground">
            The approved-list pipeline: screening checklist status at a glance.
          </p>
        </div>
        {profile?.role === "admin" && (
          <Button nativeButton={false} render={<Link href="/consultants/new">Add consultant</Link>} />
        )}
      </div>

      <ConsultantMetrics
        total={all.length}
        approved={all.filter((c) => c.status === "approved").length}
        pendingReview={all.filter((c) => c.status === "pending_review").length}
        blacklisted={all.filter((c) => blacklistedIds.has(c.id)).length}
      />

      <ConsultantsBrowser
        consultants={all}
        projectNamesByConsultant={projectNamesByConsultant}
        ratingsByConsultant={ratingsByConsultant}
        blacklistedDisciplinesByConsultant={blacklistedDisciplinesByConsultant}
      />
    </div>
  );
}
