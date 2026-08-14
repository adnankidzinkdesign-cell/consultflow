import Link from "next/link";
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

type Consultant = Database["public"]["Tables"]["consultants"]["Row"];

export function ConsultantTable({ consultants }: { consultants: Consultant[] }) {
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
            <TableHead>Discipline</TableHead>
            <TableHead>Regions</TableHead>
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
                <Link href={`/consultants/${c.id}`} className="block">
                  {c.discipline}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/consultants/${c.id}`} className="block">
                  {c.regions.length > 0 ? c.regions.join(", ") : "—"}
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
