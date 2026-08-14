import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import { getConsultantProjectNames } from "@/lib/queries/consultant-projects";
import { RouteModal } from "@/components/consultflow/route-modal";
import { ConsultantForm } from "@/components/consultflow/consultant-form";
import { updateConsultant } from "@/lib/actions/consultants";

export default async function EditConsultantModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getSessionProfile();
  if (profile?.role !== "admin") {
    redirect(`/consultants/${id}`);
  }

  const supabase = await createClient();
  const { data: consultant } = await supabase
    .from("consultants")
    .select("*")
    .eq("id", id)
    .single();

  if (!consultant) notFound();

  const projectNames = await getConsultantProjectNames(supabase, id);

  return (
    <RouteModal title={`Edit ${consultant.company_name}`}>
      <ConsultantForm
        action={updateConsultant.bind(null, id)}
        consultant={consultant}
        projectNames={projectNames}
        submitLabel="Save changes"
      />
    </RouteModal>
  );
}
