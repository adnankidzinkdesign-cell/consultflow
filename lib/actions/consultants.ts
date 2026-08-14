"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import type {
  ConsultantStatus,
  ConsultantTier,
} from "@/lib/supabase/types";

export interface ConsultantFormState {
  error: string | null;
}

// Shared by `regions` and `disciplines` — both are comma-separated text
// inputs backed by a text[] column, e.g. "Structural Engineering, MEP".
function parseCommaSeparated(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
}

/**
 * Replaces a consultant's project assignments with `projectNames`,
 * looking up each by case-insensitive name (so "RGS" and "rgs" resolve to
 * the same project instead of drifting into near-duplicates) and creating
 * a `projects` row for any name not seen before. Always fully replaces the
 * set rather than diffing — same approach as the disciplines/regions
 * arrays, just backed by a real join table instead of a text[] column.
 */
async function syncConsultantProjects(
  supabase: Awaited<ReturnType<typeof createClient>>,
  consultantId: string,
  projectNames: string[]
) {
  await supabase.from("consultant_projects").delete().eq("consultant_id", consultantId);
  if (projectNames.length === 0) return;

  const { data: existingProjects } = await supabase.from("projects").select("id, name");
  const idByLowerName = new Map(
    (existingProjects ?? []).map((p) => [p.name.toLowerCase(), p.id])
  );

  const projectIds = new Set<string>();
  for (const name of projectNames) {
    const key = name.toLowerCase();
    let id = idByLowerName.get(key);
    if (!id) {
      const { data: created, error } = await supabase
        .from("projects")
        .insert({ name })
        .select("id")
        .single();
      if (error || !created) continue; // best-effort; don't block saving the consultant over one bad project name
      id = created.id;
      idByLowerName.set(key, id);
    }
    projectIds.add(id);
  }

  if (projectIds.size > 0) {
    await supabase.from("consultant_projects").insert(
      Array.from(projectIds, (project_id) => ({ consultant_id: consultantId, project_id }))
    );
  }
}

/**
 * Creates a consultant record and seeds one consultant_checklist_items row
 * per active checklist item definition (all starting `not_submitted`), so
 * the detail page always has a full checklist grid to render/track against.
 *
 * Admin-only: RLS enforces this server-side regardless of what the UI
 * shows, but we also check here so a non-admin gets a clear error instead
 * of a opaque database rejection.
 */
export async function createConsultant(
  _prevState: ConsultantFormState,
  formData: FormData
): Promise<ConsultantFormState> {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Only admins can add consultants." };
  }

  const companyName = (formData.get("company_name") as string)?.trim();
  const disciplines = parseCommaSeparated(formData.get("disciplines"));

  if (!companyName || disciplines.length === 0) {
    return { error: "Company name and at least one discipline are required." };
  }

  const supabase = await createClient();

  const { data: consultant, error } = await supabase
    .from("consultants")
    .insert({
      company_name: companyName,
      contact_name: (formData.get("contact_name") as string)?.trim() || null,
      disciplines,
      contact_email: (formData.get("contact_email") as string)?.trim() || null,
      contact_phone: (formData.get("contact_phone") as string)?.trim() || null,
      regions: parseCommaSeparated(formData.get("regions")),
      notes: (formData.get("notes") as string)?.trim() || null,
      created_by: profile.userId,
    })
    .select("id")
    .single();

  if (error || !consultant) {
    return { error: error?.message ?? "Failed to create consultant." };
  }

  await syncConsultantProjects(supabase, consultant.id, parseCommaSeparated(formData.get("projects")));

  const { data: checklistDefs } = await supabase
    .from("checklist_item_defs")
    .select("id")
    .eq("is_active", true);

  if (checklistDefs && checklistDefs.length > 0) {
    await supabase.from("consultant_checklist_items").insert(
      checklistDefs.map((def) => ({
        consultant_id: consultant.id,
        checklist_item_id: def.id,
      }))
    );
  }

  revalidatePath("/consultants");
  redirect(`/consultants/${consultant.id}`);
}

export async function updateConsultant(
  consultantId: string,
  _prevState: ConsultantFormState,
  formData: FormData
): Promise<ConsultantFormState> {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Only admins can edit consultants." };
  }

  const companyName = (formData.get("company_name") as string)?.trim();
  const disciplines = parseCommaSeparated(formData.get("disciplines"));

  if (!companyName || disciplines.length === 0) {
    return { error: "Company name and at least one discipline are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("consultants")
    .update({
      company_name: companyName,
      contact_name: (formData.get("contact_name") as string)?.trim() || null,
      disciplines,
      contact_email: (formData.get("contact_email") as string)?.trim() || null,
      contact_phone: (formData.get("contact_phone") as string)?.trim() || null,
      regions: parseCommaSeparated(formData.get("regions")),
      status: formData.get("status") as ConsultantStatus,
      tier: formData.get("tier") as ConsultantTier,
      notes: (formData.get("notes") as string)?.trim() || null,
    })
    .eq("id", consultantId);

  if (error) {
    return { error: error.message };
  }

  await syncConsultantProjects(supabase, consultantId, parseCommaSeparated(formData.get("projects")));

  revalidatePath("/consultants");
  revalidatePath(`/consultants/${consultantId}`);
  redirect(`/consultants/${consultantId}`);
}
