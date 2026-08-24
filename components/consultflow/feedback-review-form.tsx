"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input, Button, Checkbox, StarRatingField } from "@kidzink/ui";
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FEEDBACK_CATEGORIES } from "@/lib/supabase/types";
import type { FeedbackFormState } from "@/lib/actions/feedback";

export function FeedbackReviewForm({
  action,
  disciplineOptions,
  regionOptions,
}: {
  action: (
    state: FeedbackFormState,
    formData: FormData
  ) => Promise<FeedbackFormState>;
  /** The consultant's own disciplines — the review can only cover a subset of these. */
  disciplineOptions: string[];
  /** The consultant's own regions — may be empty, unlike disciplineOptions. */
  regionOptions: string[];
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const disciplineChipsAnchor = useComboboxAnchor();
  const regionChipsAnchor = useComboboxAnchor();
  const [blacklisted, setBlacklisted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

      <div className="space-y-1.5">
        <Label htmlFor="disciplines">Discipline(s) covered by this review</Label>
        <Combobox items={disciplineOptions} name="disciplines" multiple autoHighlight>
          <ComboboxChips ref={disciplineChipsAnchor}>
            <ComboboxValue>
              {(selected: string[]) =>
                selected.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput
              id="disciplines"
              placeholder={disciplineOptions.length ? "Select discipline(s)" : "No disciplines on file"}
            />
          </ComboboxChips>
          <ComboboxContent anchor={disciplineChipsAnchor}>
            <ComboboxEmpty>No matches</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="regions">Region(s) covered by this review</Label>
        <Combobox items={regionOptions} name="regions" multiple autoHighlight>
          <ComboboxChips ref={regionChipsAnchor}>
            <ComboboxValue>
              {(selected: string[]) =>
                selected.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput
              id="regions"
              placeholder={regionOptions.length ? "Select region(s)" : "No regions on file"}
            />
          </ComboboxChips>
          <ComboboxContent anchor={regionChipsAnchor}>
            <ComboboxEmpty>No matches</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
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
        <Checkbox
          name="blacklist"
          size="sm"
          className="mt-0.5"
          checked={blacklisted}
          onCheckedChange={(checked) => {
            if (checked) {
              // Don't flip the checkbox on yet — wait for confirmation below.
              setConfirmOpen(true);
            } else {
              setBlacklisted(false);
            }
          }}
        />
        <span>
          <span className="font-medium text-foreground">
            Blacklist for the discipline(s) selected above
          </span>
          <span className="block text-muted-foreground">
            Marks this consultant ineligible for future engagements in those
            discipline(s) only — not company-wide.
          </span>
        </span>
      </label>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blacklist for these disciplines?</DialogTitle>
            <DialogDescription>
              Are you sure you want to blacklist this consultant? Blacklisting
              a consultant marks them as ineligible for future engagements in
              the discipline(s) selected above — other disciplines they offer
              are unaffected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setBlacklisted(true)}
                />
              }
            >
              Blacklist
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
