import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import { getConsultantOptionValues } from "@/lib/queries/consultant-options";
import { RouteModal } from "@/components/consultflow/route-modal";
import { ConsultantForm } from "@/components/consultflow/consultant-form";
import { createConsultant } from "@/lib/actions/consultants";

export default async function NewConsultantModal() {
  const profile = await getSessionProfile();
  if (profile?.role !== "admin") {
    redirect("/consultants");
  }

  const supabase = await createClient();
  const { disciplines, regions } = await getConsultantOptionValues(supabase);

  return (
    <RouteModal
      title="Add consultant"
      description="Creates the record and seeds the screening checklist against it."
    >
      <ConsultantForm
        action={createConsultant}
        submitLabel="Add consultant"
        disciplineSuggestions={disciplines}
        regionSuggestions={regions}
      />
    </RouteModal>
  );
}
