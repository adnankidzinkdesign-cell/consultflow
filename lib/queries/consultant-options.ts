import type { createClient } from "@/lib/supabase/server";

/**
 * Distinct discipline/region values already in use across every consultant
 * — used to power the typeahead suggestions in the Disciplines/Regions tag
 * inputs on the consultant form, so new entries stay consistent with
 * existing ones instead of drifting into near-duplicates.
 */
export async function getConsultantOptionValues(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ disciplines: string[]; regions: string[] }> {
  const { data } = await supabase.from("consultants").select("disciplines, regions");

  const disciplines = new Set<string>();
  const regions = new Set<string>();
  for (const row of data ?? []) {
    row.disciplines.forEach((d) => disciplines.add(d));
    row.regions.forEach((r) => regions.add(r));
  }

  return {
    disciplines: Array.from(disciplines).sort(),
    regions: Array.from(regions).sort(),
  };
}
