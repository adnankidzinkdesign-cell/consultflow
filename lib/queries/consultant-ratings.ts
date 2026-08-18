import type { createClient } from "@/lib/supabase/server";
import { FEEDBACK_CATEGORIES } from "@/lib/supabase/types";

export interface ConsultantRatingSummary {
  /** Average across all 5 categories and all reviews, 1-5. */
  average: number;
  /** Number of reviews the average is based on. */
  count: number;
}

/**
 * Summarizes every consultant's feedback reviews into a single overall
 * average + review count, for the "Rating" column on the consultants list.
 * One query for all reviews rather than N queries (one per consultant) —
 * the list already needs every consultant in memory for client-side
 * filtering, so this follows the same shape.
 */
export async function getConsultantRatings(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Record<string, ConsultantRatingSummary>> {
  const { data: reviews } = await supabase
    .from("feedback_reviews")
    .select(
      "consultant_id, technical_competence, quality_of_deliverables, programme_reliability, communication, commercial_value"
    );

  const result: Record<string, ConsultantRatingSummary> = {};
  for (const review of reviews ?? []) {
    const reviewAverage =
      FEEDBACK_CATEGORIES.reduce((sum, { key }) => sum + review[key], 0) /
      FEEDBACK_CATEGORIES.length;
    const bucket = result[review.consultant_id] ?? { average: 0, count: 0 };
    bucket.average = (bucket.average * bucket.count + reviewAverage) / (bucket.count + 1);
    bucket.count += 1;
    result[review.consultant_id] = bucket;
  }
  return result;
}
