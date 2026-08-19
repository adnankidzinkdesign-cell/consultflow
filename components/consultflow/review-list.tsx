import { StarRatingDisplay } from "@/components/consultflow/star-rating-display";
import { DisciplineBadge } from "@/components/consultflow/discipline-badge";
import { Badge } from "@/components/ui/badge";
import { FEEDBACK_CATEGORIES, type Database } from "@/lib/supabase/types";

type FeedbackReview = Database["public"]["Tables"]["feedback_reviews"]["Row"];

export function ReviewList({
  reviews,
  reviewerNames,
}: {
  reviews: FeedbackReview[];
  reviewerNames: Record<string, string>;
}) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
        No reviews yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="space-y-3 rounded-lg border border-border bg-card p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                {review.project_name || "Untitled project"}
              </p>
              <p className="text-xs text-muted-foreground">
                {reviewerNames[review.reviewer_id] ?? "Unknown reviewer"} ·{" "}
                {new Date(review.created_at).toLocaleDateString()}
              </p>
              {review.disciplines.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {review.disciplines.map((discipline) => (
                    <DisciplineBadge key={discipline} discipline={discipline} />
                  ))}
                </div>
              )}
            </div>
            {review.blacklist && <Badge variant="destructive">Blacklisted</Badge>}
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2">
            {FEEDBACK_CATEGORIES.map(({ key, label }) => (
              <StarRatingDisplay key={key} label={label} value={review[key]} />
            ))}
          </div>

          {review.comments && (
            <p className="border-t border-border pt-3 text-sm text-foreground">
              {review.comments}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
