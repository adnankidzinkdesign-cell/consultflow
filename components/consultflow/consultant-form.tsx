"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ConsultantStatus,
  ConsultantTier,
  Database,
} from "@/lib/supabase/types";
import type { ConsultantFormState } from "@/lib/actions/consultants";

type Consultant = Database["public"]["Tables"]["consultants"]["Row"];

const STATUS_OPTIONS: { value: ConsultantStatus; label: string }[] = [
  { value: "pending_review", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const TIER_OPTIONS: { value: ConsultantTier; label: string }[] = [
  { value: "unrated", label: "Unrated" },
  { value: "tier_1", label: "Tier 1" },
  { value: "tier_2", label: "Tier 2" },
  { value: "tier_3", label: "Tier 3" },
];

export function ConsultantForm({
  action,
  consultant,
  submitLabel,
}: {
  action: (
    state: ConsultantFormState,
    formData: FormData
  ) => Promise<ConsultantFormState>;
  consultant?: Consultant;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="company_name">Company name *</Label>
        <Input
          id="company_name"
          name="company_name"
          required
          defaultValue={consultant?.company_name}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contact_name">Contact name</Label>
          <Input
            id="contact_name"
            name="contact_name"
            defaultValue={consultant?.contact_name ?? undefined}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="discipline">Discipline *</Label>
          <Input
            id="discipline"
            name="discipline"
            required
            placeholder="e.g. Structural Engineering"
            defaultValue={consultant?.discipline}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contact_email">Contact email *</Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            required
            defaultValue={consultant?.contact_email}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_phone">Contact phone</Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            defaultValue={consultant?.contact_phone ?? undefined}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="regions">Regions</Label>
        <Input
          id="regions"
          name="regions"
          placeholder="Comma-separated, e.g. UAE, KSA, Qatar"
          defaultValue={consultant?.regions.join(", ")}
        />
      </div>

      {consultant && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={consultant.status}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tier">Tier</Label>
            <Select name="tier" defaultValue={consultant.tier}>
              <SelectTrigger id="tier" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={consultant?.notes ?? undefined}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
