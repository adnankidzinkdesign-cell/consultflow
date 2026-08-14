import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsultantStatusBadge, TierBadge } from "@/components/consultflow/status-badges";
import { StarRatingDisplay } from "@/components/consultflow/star-rating-display";
import { ReviewList } from "@/components/consultflow/review-list";
import { FEEDBACK_CATEGORIES, type FeedbackCategoryKey } from "@/lib/supabase/types";

export default async function ConsultantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, supabase] = await Promise.all([
    getSessionProfile(),
    createClient(),
  ]);

  const { data: consultant } = await supabase
    .from("consultants")
    .select("*")
    .eq("id", id)
    .single();

  if (!consultant) notFound();

  const { data: reviews } = await supabase
    .from("feedback_reviews")
    .select("*")
    .eq("consultant_id", id)
    .order("created_at", { ascending: false });

  const reviewerIds = Array.from(new Set((reviews ?? []).map((r) => r.reviewer_id)));
  const { data: reviewerProfiles } = reviewerIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", reviewerIds)
    : { data: [] as { id: string; full_name: string | null; email: string }[] };

  const reviewerNames = Object.fromEntries(
    (reviewerProfiles ?? []).map((p) => [p.id, p.full_name ?? p.email])
  );

  const isBlacklisted = (reviews ?? []).some((r) => r.blacklist);

  const averages =
    reviews && reviews.length > 0
      ? FEEDBACK_CATEGORIES.reduce<Record<FeedbackCategoryKey, number>>((acc, { key }) => {
          const total = reviews.reduce((sum, r) => sum + r[key], 0);
          acc[key] = Math.round(total / reviews.length);
          return acc;
        }, {} as Record<FeedbackCategoryKey, number>)
      : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">
              {consultant.company_name}
            </h1>
            <ConsultantStatusBadge status={consultant.status} />
            <TierBadge tier={consultant.tier} />
            {isBlacklisted && <Badge variant="destructive">Blacklisted</Badge>}
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide">Discipline</dt>
              <dd className="text-foreground">{consultant.discipline}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Regions</dt>
              <dd className="text-foreground">
                {consultant.regions.length > 0 ? consultant.regions.join(", ") : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Contact</dt>
              <dd className="text-foreground">
                {consultant.contact_name && <>{consultant.contact_name} · </>}
                {consultant.contact_email}
              </dd>
            </div>
          </dl>
          {consultant.notes && (
            <p className="max-w-2xl text-sm text-muted-foreground">{consultant.notes}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            render={<Link href={`/consultants/${id}/reviews/new`}>Leave a review</Link>}
          />
          {profile?.role === "admin" && (
            <Button variant="secondary" render={<Link href={`/consultants/${id}/edit`}>Edit</Link>} />
          )}
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Feedback reviews {reviews && reviews.length > 0 && `(${reviews.length})`}
          </h2>
        </div>

        {averages && (
          <div className="space-y-1.5 rounded-lg border border-border bg-card p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Average across all reviews
            </p>
            {FEEDBACK_CATEGORIES.map(({ key, label }) => (
              <StarRatingDisplay key={key} label={label} value={averages[key]} />
            ))}
          </div>
        )}

        <ReviewList reviews={reviews ?? []} reviewerNames={reviewerNames} />
      </section>
    </div>
  );
}
