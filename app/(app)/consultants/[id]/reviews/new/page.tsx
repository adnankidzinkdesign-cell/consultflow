import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeedbackReviewForm } from "@/components/consultflow/feedback-review-form";
import { createFeedbackReview } from "@/lib/actions/feedback";

export default async function NewReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: consultant } = await supabase
    .from("consultants")
    .select("id, company_name")
    .eq("id", id)
    .single();

  if (!consultant) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Review {consultant.company_name}
        </h1>
        <p className="text-sm text-muted-foreground">
          End-of-project feedback — rate each category out of 5 stars.
        </p>
      </div>
      <FeedbackReviewForm action={createFeedbackReview.bind(null, id)} />
    </div>
  );
}
