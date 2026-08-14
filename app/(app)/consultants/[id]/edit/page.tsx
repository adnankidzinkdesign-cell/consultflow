import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import { ConsultantForm } from "@/components/consultflow/consultant-form";
import { updateConsultant } from "@/lib/actions/consultants";

export default async function EditConsultantPage({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Edit {consultant.company_name}
        </h1>
      </div>
      <ConsultantForm
        action={updateConsultant.bind(null, id)}
        consultant={consultant}
        submitLabel="Save changes"
      />
    </div>
  );
}
