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

/**
 * Same idea as `getConsultantProjectNames`, but for every consultant at
 * once — used by the consultants list, which now filters client-side and
 * needs each row's project names available up front rather than re-querying
 * per consultant_id on every filter change.
 */
export async function getAllConsultantProjectNames(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Record<string, string[]>> {
  const [{ data: links }, { data: projects }] = await Promise.all([
    supabase.from("consultant_projects").select("consultant_id, project_id"),
    supabase.from("projects").select("id, name"),
  ]);

  const nameById = new Map((projects ?? []).map((p) => [p.id, p.name]));
  const result: Record<string, string[]> = {};
  for (const link of links ?? []) {
    const name = nameById.get(link.project_id);
    if (!name) continue;
    (result[link.consultant_id] ??= []).push(name);
  }
  for (const consultantId of Object.keys(result)) {
    result[consultantId].sort();
  }
  return result;
}
