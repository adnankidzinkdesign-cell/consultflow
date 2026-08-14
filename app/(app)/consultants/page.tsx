import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import { Button } from "@/components/ui/button";
import { ConsultantTable } from "@/components/consultflow/consultant-table";
import { ConsultantFilters } from "@/components/consultflow/consultant-filters";

export default async function ConsultantsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    discipline?: string;
    region?: string;
    status?: string;
  }>;
}) {
  const { q, discipline, region, status } = await searchParams;
  const [profile, supabase] = await Promise.all([
    getSessionProfile(),
    createClient(),
  ]);

  let query = supabase.from("consultants").select("*").order("company_name");

  if (q) {
    query = query.or(`company_name.ilike.%${q}%,contact_name.ilike.%${q}%`);
  }
  if (discipline && discipline !== "all") {
    query = query.eq("discipline", discipline);
  }
  if (region) {
    query = query.contains("regions", [region]);
  }
  if (status && status !== "all") {
    query = query.eq(
      "status",
      status as "pending_review" | "approved" | "rejected" | "suspended"
    );
  }

  const [{ data: consultants }, { data: disciplineRows }] = await Promise.all([
    query,
    supabase.from("consultants").select("discipline"),
  ]);

  const disciplines = Array.from(
    new Set((disciplineRows ?? []).map((r) => r.discipline))
  ).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Consultants</h1>
          <p className="text-sm text-muted-foreground">
            The approved-list pipeline: screening checklist status at a glance.
          </p>
        </div>
        {profile?.role === "admin" && (
          <Button render={<Link href="/consultants/new">Add consultant</Link>} />
        )}
      </div>

      <ConsultantFilters
        q={q}
        discipline={discipline}
        region={region}
        status={status}
        disciplines={disciplines}
      />

      <ConsultantTable consultants={consultants ?? []} />
    </div>
  );
}
