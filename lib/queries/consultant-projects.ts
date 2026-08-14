import type { createClient } from "@/lib/supabase/server";

/**
 * Resolves a consultant's assigned project names via consultant_projects.
 * Two plain queries rather than an embedded PostgREST select — our
 * hand-written Database type doesn't carry Relationships metadata, so
 * embedded-resource results would need manual typing anyway (see
 * lib/supabase/types.ts's header comment).
 */
export async function getConsultantProjectNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  consultantId: string
): Promise<string[]> {
  const { data: links } = await supabase
    .from("consultant_projects")
    .select("project_id")
    .eq("consultant_id", consultantId);

  const projectIds = (links ?? []).map((l) => l.project_id);
  if (projectIds.length === 0) return [];

  const { data: projects } = await supabase
    .from("projects")
    .select("name")
    .in("id", projectIds);

  return (projects ?? []).map((p) => p.name).sort();
}
