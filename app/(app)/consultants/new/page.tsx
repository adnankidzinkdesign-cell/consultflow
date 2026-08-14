import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import { ConsultantForm } from "@/components/consultflow/consultant-form";
import { createConsultant } from "@/lib/actions/consultants";

export default async function NewConsultantPage() {
  const profile = await getSessionProfile();
  if (profile?.role !== "admin") {
    redirect("/consultants");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Add consultant</h1>
        <p className="text-sm text-muted-foreground">
          Creates the record and seeds the screening checklist against it.
        </p>
      </div>
      <ConsultantForm action={createConsultant} submitLabel="Add consultant" />
    </div>
  );
}
