"use client";

import { useMemo, useState } from "react";
import {
  ConsultantFilters,
  DEFAULT_CONSULTANT_FILTERS,
  type ConsultantFilterValues,
} from "@/components/consultflow/consultant-filters";
import { ConsultantTable } from "@/components/consultflow/consultant-table";
import type { Database } from "@/lib/supabase/types";
import type { ConsultantRatingSummary } from "@/lib/queries/consultant-ratings";

type Consultant = Database["public"]["Tables"]["consultants"]["Row"];

/**
 * Owns filter state and does the actual filtering in the browser — see the
 * comment in app/(app)/consultants/page.tsx for why this moved off the
 * server. `consultants`/`projectNamesByConsultant`/`ratingsByConsultant` are
 * the full, unfiltered dataset fetched once on the server.
 */
export function ConsultantsBrowser({
  consultants,
  projectNamesByConsultant,
  ratingsByConsultant,
}: {
  consultants: Consultant[];
  projectNamesByConsultant: Record<string, string[]>;
  ratingsByConsultant: Record<string, ConsultantRatingSummary>;
}) {
  const [filters, setFilters] = useState<ConsultantFilterValues>(DEFAULT_CONSULTANT_FILTERS);

  const disciplines = useMemo(
    () => Array.from(new Set(consultants.flatMap((c) => c.disciplines))).sort(),
    [consultants]
  );
  const regions = useMemo(
    () => Array.from(new Set(consultants.flatMap((c) => c.regions))).sort(),
    [consultants]
  );
  const projects = useMemo(
    () => Array.from(new Set(Object.values(projectNamesByConsultant).flat())).sort(),
    [projectNamesByConsultant]
  );

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return consultants.filter((c) => {
      if (
        q &&
        !`${c.company_name} ${c.contact_name ?? ""}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (filters.discipline !== "all" && !c.disciplines.includes(filters.discipline)) {
        return false;
      }
      if (filters.region !== "all" && !c.regions.includes(filters.region)) {
        return false;
      }
      if (
        filters.project !== "all" &&
        !(projectNamesByConsultant[c.id] ?? []).includes(filters.project)
      ) {
        return false;
      }
      if (filters.status !== "all" && c.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [consultants, filters, projectNamesByConsultant]);

  return (
    <>
      <ConsultantFilters
        value={filters}
        onChange={setFilters}
        disciplines={disciplines}
        regions={regions}
        projects={projects}
      />
      <ConsultantTable
        consultants={filtered}
        activeDiscipline={filters.discipline !== "all" ? filters.discipline : undefined}
        ratings={ratingsByConsultant}
      />
    </>
  );
}
