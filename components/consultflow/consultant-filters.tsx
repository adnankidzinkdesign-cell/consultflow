"use client";

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

export interface ConsultantFilterValues {
  q: string;
  /** A discipline value, or "all". */
  discipline: string;
  /** A region value, or "all". */
  region: string;
  /** A project name, or "all". */
  project: string;
  /** A ConsultantStatus value, or "all". */
  status: string;
}

export const DEFAULT_CONSULTANT_FILTERS: ConsultantFilterValues = {
  q: "",
  discipline: "all",
  region: "all",
  project: "all",
  status: "all",
};

/**
 * Fully controlled — the parent (ConsultantsBrowser) owns filter state and
 * re-filters the in-memory consultant list on every change, so there's no
 * form submission/navigation here, just live updates as you type/select.
 */
export function ConsultantFilters({
  value,
  onChange,
  disciplines,
  regions,
  projects,
}: {
  value: ConsultantFilterValues;
  onChange: (value: ConsultantFilterValues) => void;
  disciplines: string[];
  regions: string[];
  projects: string[];
}) {
  const hasActiveFilters =
    value.q !== "" ||
    value.discipline !== "all" ||
    value.region !== "all" ||
    value.project !== "all" ||
    value.status !== "all";

  function set<K extends keyof ConsultantFilterValues>(
    key: K,
    next: ConsultantFilterValues[K]
  ) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="q" className="text-xs font-medium text-muted-foreground">
          Search
        </label>
        <Input
          id="q"
          placeholder="Company or contact name"
          value={value.q}
          onChange={(e) => set("q", e.target.value)}
          className="w-56"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="discipline" className="text-xs font-medium text-muted-foreground">
          Disciplines
        </label>
        <Combobox
          items={disciplines}
          value={value.discipline === "all" ? null : value.discipline}
          onValueChange={(next) => set("discipline", next ?? "all")}
          autoHighlight
        >
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
        <Combobox
          items={regions}
          value={value.region === "all" ? null : value.region}
          onValueChange={(next) => set("region", next ?? "all")}
          autoHighlight
        >
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
        <label htmlFor="project" className="text-xs font-medium text-muted-foreground">
          Project
        </label>
        <Combobox
          items={projects}
          value={value.project === "all" ? null : value.project}
          onValueChange={(next) => set("project", next ?? "all")}
          autoHighlight
        >
          <ComboboxInput id="project" placeholder="Any project" showClear className="w-40" />
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
        <Select value={value.status} onValueChange={(next) => set("status", next ?? "all")}>
          <SelectTrigger id="status" className="w-44">
            <SelectValue placeholder="All statuses">
              {(v: string) =>
                v === "all" ? "All statuses" : STATUS_LABELS[v as ConsultantStatus]
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

      {hasActiveFilters && (
        <Button variant="ghost" onClick={() => onChange(DEFAULT_CONSULTANT_FILTERS)}>
          Clear
        </Button>
      )}
    </div>
  );
}
