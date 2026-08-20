import Link from "next/link";
import { FractionalStar, TableCellText } from "@kidzink/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConsultantStatusBadge, TierBadge } from "@/components/consultflow/status-badges";
import { DisciplineBadge, DisciplineBadgeList } from "@/components/consultflow/discipline-badge";
import type { Database } from "@/lib/supabase/types";
import type { ConsultantRatingSummary } from "@/lib/queries/consultant-ratings";

type Consultant = Database["public"]["Tables"]["consultants"]["Row"];

/** Keeps a badge from stretching the column when a discipline name is long. */
const TABLE_BADGE_CLASSNAME = "max-w-56";

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
          <TableRow className="bg-muted hover:bg-muted">
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
            <TableRow key={c.id} className="cursor-pointer even:bg-muted/30">
              <TableCell className="font-medium">
                <Link href={`/consultants/${c.id}`} className="block">
                  {/* nth-child(2) only matches the optional supporting line
                      (contact_name), so a company with no contact_name keeps
                      its normal single-line size/weight. */}
                  <TableCellText
                    primary={c.company_name}
                    supporting={c.contact_name}
                    className="[&>span:nth-child(2)]:text-xs [&>span:nth-child(2)]:font-normal"
                  />
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/consultants/${c.id}`}
                  className="block"
                  title={c.disciplines.join(", ")}
                >
                  {activeDiscipline ? (
                    <DisciplineBadge
                      discipline={activeDiscipline}
                      className={TABLE_BADGE_CLASSNAME}
                    />
                  ) : (
                    <DisciplineBadgeList
                      disciplines={c.disciplines}
                      max={1}
                      badgeClassName={TABLE_BADGE_CLASSNAME}
                    />
                  )}
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
                      <FractionalStar fill={ratings[c.id].average / 5} className="size-3.5" />
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
