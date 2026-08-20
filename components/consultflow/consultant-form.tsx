"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kidzink/ui";
import { TagInput } from "@/components/consultflow/tag-input";
import { disciplineBadgeClassName } from "@/components/consultflow/discipline-badge";
import {
  CONSULTANT_STATUS_OPTIONS,
  CONSULTANT_TIER_OPTIONS,
} from "@/components/consultflow/status-badges";
import type {
  ConsultantStatus,
  ConsultantTier,
  Database,
} from "@/lib/supabase/types";
import type { ConsultantFormState } from "@/lib/actions/consultants";

type Consultant = Database["public"]["Tables"]["consultants"]["Row"];

const STATUS_OPTIONS = CONSULTANT_STATUS_OPTIONS;
const TIER_OPTIONS = CONSULTANT_TIER_OPTIONS;

// Base UI's Select.Value shows the raw value by default — unlike Radix, it
// doesn't automatically display the matched SelectItem's label — so the
// trigger needs an explicit value -> label mapping via `children`.
const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<ConsultantStatus, string>;
const TIER_LABELS = Object.fromEntries(
  TIER_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<ConsultantTier, string>;

export function ConsultantForm({
  action,
  consultant,
  projectNames,
  disciplineSuggestions = [],
  regionSuggestions = [],
  submitLabel,
}: {
  action: (
    state: ConsultantFormState,
    formData: FormData
  ) => Promise<ConsultantFormState>;
  consultant?: Consultant;
  /** Current project assignments, when editing — fetched separately since
   * they live in the consultant_projects join table, not on the consultant
   * row itself. */
  projectNames?: string[];
  /** Discipline/region values already used by other consultants, for the tag inputs' typeahead. */
  disciplineSuggestions?: string[];
  regionSuggestions?: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [disciplines, setDisciplines] = useState<string[]>(consultant?.disciplines ?? []);
  const [regions, setRegions] = useState<string[]>(consultant?.regions ?? []);

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
          <Label htmlFor="contact_phone">Contact phone</Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            defaultValue={consultant?.contact_phone ?? undefined}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact_email">Contact email</Label>
        <Input
          id="contact_email"
          name="contact_email"
          type="email"
          defaultValue={consultant?.contact_email ?? undefined}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="disciplines">Disciplines *</Label>
        <TagInput
          id="disciplines"
          name="disciplines"
          value={disciplines}
          onChange={setDisciplines}
          suggestions={disciplineSuggestions}
          placeholder="Type a discipline and press Enter or comma…"
          chipClassName={disciplineBadgeClassName}
        />
        {disciplines.length === 0 && (
          <p className="text-xs text-destructive">At least one discipline is required.</p>
        )}
        <p className="text-xs text-muted-foreground">
          One consultant can offer multiple disciplines/services — list them all here
          instead of adding the company more than once.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="projects">Projects</Label>
        <Input
          id="projects"
          name="projects"
          placeholder="Comma-separated, e.g. RGS, HORIZON, DULWICH"
          defaultValue={projectNames?.join(", ")}
        />
        <p className="text-xs text-muted-foreground">
          Which projects this consultant is/was engaged on. New project names are
          created automatically; existing ones (matched regardless of case) are reused.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="regions">Regions</Label>
        <TagInput
          id="regions"
          name="regions"
          value={regions}
          onChange={setRegions}
          suggestions={regionSuggestions}
          placeholder="Type a region and press Enter or comma…"
        />
      </div>

      {consultant && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={consultant.status}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue>
                  {(value: ConsultantStatus) => STATUS_LABELS[value]}
                </SelectValue>
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
                <SelectValue>{(value: ConsultantTier) => TIER_LABELS[value]}</SelectValue>
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
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
