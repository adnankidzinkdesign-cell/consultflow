"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StarRatingField } from "@/components/consultflow/star-rating-field";
import { FEEDBACK_CATEGORIES } from "@/lib/supabase/types";
import type { FeedbackFormState } from "@/lib/actions/feedback";

export function FeedbackReviewForm({
  action,
}: {
  action: (
    state: FeedbackFormState,
    formData: FormData
  ) => Promise<FeedbackFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="project_name">Project</Label>
        <Input id="project_name" name="project_name" placeholder="Project name" />
      </div>

      <div className="space-y-5 rounded-lg border border-border bg-card p-4">
        {FEEDBACK_CATEGORIES.map(({ key, label }) => (
          <StarRatingField key={key} name={key} label={label} />
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comments">General comments</Label>
        <Textarea id="comments" name="comments" rows={4} placeholder="Write comments here" />
      </div>

      <label className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
        <input type="checkbox" name="blacklist" className="mt-0.5 size-4" />
        <span>
          <span className="font-medium text-foreground">Blacklist this consultant</span>
          <span className="block text-muted-foreground">
            Flags them across ConsultFlow as not to be used on future projects.
          </span>
        </span>
      </label>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
