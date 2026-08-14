"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";

export interface ChecklistActionState {
  error: string | null;
}

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Uploads (or replaces) the document for one consultant's checklist item.
 * Admin-only for now (there is no consultant self-service upload yet —
 * that's a planned future phase via a magic-link/token mechanism).
 *
 * File validation happens here, server-side, against the actual bytes —
 * never trust a client-side <input accept> attribute, which is only a UI
 * hint and easy to bypass.
 */
export async function uploadChecklistDocument(
  _prevState: ChecklistActionState,
  formData: FormData
): Promise<ChecklistActionState> {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Only admins can upload checklist documents." };
  }

  const consultantId = formData.get("consultant_id") as string;
  const checklistItemId = formData.get("checklist_item_id") as string;
  const expiryDateRaw = formData.get("expiry_date") as string | null;
  const file = formData.get("file") as File | null;

  if (!consultantId || !checklistItemId || !file || file.size === 0) {
    return { error: "A file is required." };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { error: "Only PDF, PNG, or JPEG files are allowed." };
  }

  if (file.size > MAX_FILE_BYTES) {
    return { error: "File must be 10MB or smaller." };
  }

  const supabase = await createClient();

  const { data: itemDef } = await supabase
    .from("checklist_item_defs")
    .select("code, requires_expiry")
    .eq("id", checklistItemId)
    .single();

  if (!itemDef) {
    return { error: "Unknown checklist item." };
  }

  if (itemDef.requires_expiry && !expiryDateRaw) {
    return { error: "An expiry date is required for this item." };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const path = `${consultantId}/${itemDef.code}/${randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("consultant-docs")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const { error: updateError } = await supabase
    .from("consultant_checklist_items")
    .update({
      status: "submitted",
      document_path: path,
      expiry_date: itemDef.requires_expiry ? expiryDateRaw : null,
      submitted_at: new Date().toISOString(),
      verified_by: null,
      verified_at: null,
      rejection_reason: null,
    })
    .eq("consultant_id", consultantId)
    .eq("checklist_item_id", checklistItemId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath(`/consultants/${consultantId}`);
  return { error: null };
}

export async function verifyChecklistItem(
  consultantId: string,
  checklistItemId: string,
  _prevState: ChecklistActionState,
  _formData: FormData
): Promise<ChecklistActionState> {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Only admins can verify checklist items." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("consultant_checklist_items")
    .update({
      status: "verified",
      verified_by: profile.userId,
      verified_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("consultant_id", consultantId)
    .eq("checklist_item_id", checklistItemId);

  if (error) return { error: error.message };

  revalidatePath(`/consultants/${consultantId}`);
  return { error: null };
}

export async function rejectChecklistItem(
  consultantId: string,
  checklistItemId: string,
  _prevState: ChecklistActionState,
  formData: FormData
): Promise<ChecklistActionState> {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Only admins can reject checklist items." };
  }

  const reason = (formData.get("rejection_reason") as string | null) ?? "";

  const supabase = await createClient();
  const { error } = await supabase
    .from("consultant_checklist_items")
    .update({
      status: "rejected",
      verified_by: profile.userId,
      verified_at: new Date().toISOString(),
      rejection_reason: reason || null,
    })
    .eq("consultant_id", consultantId)
    .eq("checklist_item_id", checklistItemId);

  if (error) return { error: error.message };

  revalidatePath(`/consultants/${consultantId}`);
  return { error: null };
}
