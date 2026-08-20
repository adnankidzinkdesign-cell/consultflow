"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import { FEEDBACK_CATEGORIES } from "@/lib/supabase/types";

export interface FeedbackFormState {
  error: string | null;
}

/**
 * Records a post-project feedback review for a consultant. Both admin and
 * project_lead may submit one (see migration 0003 for the RLS rationale);
 * `reviewer_id` is always the signed-in user, never client-supplied.
 */
export async function createFeedbackReview(
  consultantId: string,
  _prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const profile = await getSessionProfile();
  if (!profile) {
    return { error: "You must be signed in to leave a review." };
  }

  const disciplines = formData.getAll("disciplines").map((v) => String(v).trim()).filter(Boolean);
  if (disciplines.length === 0) {
    return { error: "Select at least one discipline this review covers." };
  }

  // Unlike disciplines, not required — a consultant may have no regions on
  // file at all, so a review of them naturally can't tag any (see migration
  // 0008_feedback_review_regions.sql).
  const regions = formData.getAll("regions").map((v) => String(v).trim()).filter(Boolean);

  const ratings: Record<string, number> = {};
  for (const { key, label } of FEEDBACK_CATEGORIES) {
    const raw = formData.get(key);
    const value = raw ? Number(raw) : NaN;
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return { error: `Please rate "${label}" from 1 to 5 stars.` };
    }
    ratings[key] = value;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("feedback_reviews").insert({
    consultant_id: consultantId,
    reviewer_id: profile.userId,
    project_name: (formData.get("project_name") as string)?.trim() || null,
    disciplines,
    regions,
    technical_competence: ratings.technical_competence,
    quality_of_deliverables: ratings.quality_of_deliverables,
    programme_reliability: ratings.programme_reliability,
    communication: ratings.communication,
    commercial_value: ratings.commercial_value,
    blacklist: formData.get("blacklist") === "on",
    comments: (formData.get("comments") as string)?.trim() || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/consultants/${consultantId}`);
  redirect(`/consultants/${consultantId}`);
}
