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

function parseRegions(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
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
  const discipline = (formData.get("discipline") as string)?.trim();
  const contactEmail = (formData.get("contact_email") as string)?.trim();

  if (!companyName || !discipline || !contactEmail) {
    return { error: "Company name, discipline, and contact email are required." };
  }

  const supabase = await createClient();

  const { data: consultant, error } = await supabase
    .from("consultants")
    .insert({
      company_name: companyName,
      contact_name: (formData.get("contact_name") as string)?.trim() || null,
      discipline,
      contact_email: contactEmail,
      contact_phone: (formData.get("contact_phone") as string)?.trim() || null,
      regions: parseRegions(formData.get("regions")),
      notes: (formData.get("notes") as string)?.trim() || null,
      created_by: profile.userId,
    })
    .select("id")
    .single();

  if (error || !consultant) {
    return { error: error?.message ?? "Failed to create consultant." };
  }

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
  const discipline = (formData.get("discipline") as string)?.trim();
  const contactEmail = (formData.get("contact_email") as string)?.trim();

  if (!companyName || !discipline || !contactEmail) {
    return { error: "Company name, discipline, and contact email are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("consultants")
    .update({
      company_name: companyName,
      contact_name: (formData.get("contact_name") as string)?.trim() || null,
      discipline,
      contact_email: contactEmail,
      contact_phone: (formData.get("contact_phone") as string)?.trim() || null,
      regions: parseRegions(formData.get("regions")),
      status: formData.get("status") as ConsultantStatus,
      tier: formData.get("tier") as ConsultantTier,
      notes: (formData.get("notes") as string)?.trim() || null,
    })
    .eq("id", consultantId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/consultants");
  revalidatePath(`/consultants/${consultantId}`);
  redirect(`/consultants/${consultantId}`);
}
