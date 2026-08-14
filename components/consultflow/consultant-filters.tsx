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
import type { ConsultantStatus } from "@/lib/supabase/types";

const STATUS_OPTIONS: { value: ConsultantStatus; label: string }[] = [
  { value: "pending_review", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

/**
 * Plain GET form — submitting re-navigates to /consultants with the chosen
 * filters as query params, which the list page (a Server Component) reads
 * directly. No client-side JS needed for filtering.
 */
export function ConsultantFilters({
  q,
  discipline,
  region,
  status,
  disciplines,
}: {
  q?: string;
  discipline?: string;
  region?: string;
  status?: string;
  disciplines: string[];
}) {
  return (
    <form className="flex flex-wrap items-end gap-3" action="/consultants">
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
          Discipline
        </label>
        <Select name="discipline" defaultValue={discipline || "all"}>
          <SelectTrigger id="discipline" className="w-44">
            <SelectValue placeholder="All disciplines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All disciplines</SelectItem>
            {disciplines.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="region" className="text-xs font-medium text-muted-foreground">
          Region
        </label>
        <Input
          id="region"
          name="region"
          placeholder="e.g. UAE"
          defaultValue={region}
          className="w-32"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
          Status
        </label>
        <Select name="status" defaultValue={status || "all"}>
          <SelectTrigger id="status" className="w-44">
            <SelectValue placeholder="All statuses" />
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
        <Button variant="ghost" render={<Link href="/consultants">Clear</Link>} />
      )}
    </form>
  );
}
