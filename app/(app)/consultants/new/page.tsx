import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import { getConsultantOptionValues } from "@/lib/queries/consultant-options";
import { ConsultantForm } from "@/components/consultflow/consultant-form";
import { createConsultant } from "@/lib/actions/consultants";

export default async function NewConsultantPage() {
  const profile = await getSessionProfile();
  if (profile?.role !== "admin") {
    redirect("/consultants");
  }

  const supabase = await createClient();
  const { disciplines, regions } = await getConsultantOptionValues(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-xs font-bold text-foreground">Add consultant</h1>
        <p className="text-sm text-muted-foreground">
          Creates the record and seeds the screening checklist against it.
        </p>
      </div>
      <ConsultantForm
        action={createConsultant}
        submitLabel="Add consultant"
        disciplineSuggestions={disciplines}
        regionSuggestions={regions}
      />
    </div>
  );
}
