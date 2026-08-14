"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { ConsultantStatus } from "@/lib/supabase/types";

const STATUS_OPTIONS: { value: ConsultantStatus; label: string }[] = [
  { value: "pending_review", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<ConsultantStatus, string>;

/**
 * Plain GET form — submitting re-navigates to /consultants with the chosen
 * filters as query params, which the list page (a Server Component) reads
 * directly. No client-side JS needed for filtering, including the
 * Comboboxes below — Base UI's Combobox.Root takes a `name` prop and
 * renders a hidden native input, same as Select does.
 */
export function ConsultantFilters({
  q,
  discipline,
  region,
  status,
  disciplines,
  regions,
}: {
  q?: string;
  discipline?: string;
  region?: string;
  status?: string;
  disciplines: string[];
  regions: string[];
}) {
  // Re-mount the whole form (rather than update in place) whenever the
  // active filters change — the Select/Combobox fields below use
  // `defaultValue` (uncontrolled), and Base UI warns if that changes on an
  // already-mounted instance, which happens when navigating between
  // filtered URLs without a full page reload.
  const formKey = `${q ?? ""}|${discipline ?? ""}|${region ?? ""}|${status ?? ""}`;

  return (
    <form key={formKey} className="flex flex-wrap items-end gap-3" action="/consultants">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="q" className="text-xs font-medium text-muted-foreground">
          Search
        </label>
        <Input
          id="q"
          name="q"
          placeholder="Company or contact name"
          defaultValue={q}
          className="w-56"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="discipline" className="text-xs font-medium text-muted-foreground">
          Disciplines
        </label>
        <Combobox items={disciplines} name="discipline" defaultValue={discipline || null} autoHighlight>
          <ComboboxInput
            id="discipline"
            placeholder="Any discipline"
            showClear
            className="w-48"
          />
          <ComboboxContent>
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="region" className="text-xs font-medium text-muted-foreground">
          Region
        </label>
        <Combobox items={regions} name="region" defaultValue={region || null} autoHighlight>
          <ComboboxInput id="region" placeholder="Any region" showClear className="w-40" />
          <ComboboxContent>
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
          Status
        </label>
        <Select name="status" defaultValue={status || "all"}>
          <SelectTrigger id="status" className="w-44">
            <SelectValue placeholder="All statuses">
              {(value: string) =>
                value === "all" ? "All statuses" : STATUS_LABELS[value as ConsultantStatus]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" variant="secondary">
        Filter
      </Button>
      {(q || discipline || region || status) && (
        <Button variant="ghost" nativeButton={false} render={<Link href="/consultants">Clear</Link>} />
      )}
    </form>
  );
}
