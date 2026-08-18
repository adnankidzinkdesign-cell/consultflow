import Link from "next/link";
import { StarIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConsultantStatusBadge, TierBadge } from "@/components/consultflow/status-badges";
import type { Database } from "@/lib/supabase/types";
import type { ConsultantRatingSummary } from "@/lib/queries/consultant-ratings";

type Consultant = Database["public"]["Tables"]["consultants"]["Row"];

const DISCIPLINE_CHAR_LIMIT = 30;

/**
 * Keeps the Disciplines column from forcing horizontal scroll: more than
 * one discipline collapses to a fixed label (the full list is one click
 * away on the detail page, or visible via the `title` tooltip), and a
 * single long discipline name gets truncated with an ellipsis instead of
 * stretching the column.
 */
function formatDisciplines(disciplines: string[]): string {
  if (disciplines.length === 0) return "—";
  if (disciplines.length > 1) return "Multiple disciplines";
  const [only] = disciplines;
  return only.length > DISCIPLINE_CHAR_LIMIT
    ? `${only.slice(0, DISCIPLINE_CHAR_LIMIT).trimEnd()}…`
    : only;
}

export function ConsultantTable({
  consultants,
  activeDiscipline,
  ratings,
}: {
  consultants: Consultant[];
  /** The currently selected discipline filter, if any ("all" shows every discipline). */
  activeDiscipline?: string;
  /** Overall average rating + review count per consultant id, if any reviews exist. */
  ratings?: Record<string, ConsultantRatingSummary>;
}) {
  if (consultants.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        No consultants match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Disciplines</TableHead>
            <TableHead>Regions</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultants.map((c) => (
            <TableRow key={c.id} className="cursor-pointer">
              <TableCell className="font-medium">
                <Link href={`/consultants/${c.id}`} className="block">
                  {c.company_name}
                  {c.contact_name && (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {c.contact_name}
                    </span>
                  )}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/consultants/${c.id}`}
                  className="block"
                  title={c.disciplines.join(", ")}
                >
                  {activeDiscipline
                    ? formatDisciplines([activeDiscipline])
                    : formatDisciplines(c.disciplines)}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/consultants/${c.id}`} className="block">
                  {c.regions.length > 0 ? c.regions.join(", ") : "—"}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/consultants/${c.id}`} className="flex items-center gap-1">
                  {ratings?.[c.id] ? (
                    <>
                      <StarIcon className="size-3.5 fill-current text-[color:var(--color-amber)]" />
                      <span className="text-foreground">{ratings[c.id].average.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">
                        ({ratings[c.id].count})
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/consultants/${c.id}`} className="block">
                  <TierBadge tier={c.tier} />
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/consultants/${c.id}`} className="block">
                  <ConsultantStatusBadge status={c.status} />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
