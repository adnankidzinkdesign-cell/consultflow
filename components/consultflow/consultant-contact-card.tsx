import { MailIcon, PhoneIcon } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Consultant = Database["public"]["Tables"]["consultants"]["Row"];

/**
 * Dedicated contact card on the consultant detail page, matching the Figma
 * mockup (Kidzink_Digital-Transformations, node 499:6470) — pulled out of
 * the Disciplines/Projects/Regions summary list so email and phone get
 * their own visual home instead of a single inline text row.
 */
export function ConsultantContactCard({
  consultant,
}: {
  consultant: Pick<Consultant, "contact_name" | "contact_email" | "contact_phone">;
}) {
  const { contact_name, contact_email, contact_phone } = consultant;
  if (!contact_name && !contact_email && !contact_phone) return null;

  return (
    <div className="w-full shrink-0 space-y-3 rounded-lg border border-border bg-card p-4 sm:w-72">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Contact
      </p>
      <div className="space-y-2 text-sm">
        {contact_name && <p className="font-medium text-foreground">{contact_name}</p>}
        {contact_email && (
          <a
            href={`mailto:${contact_email}`}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <MailIcon className="size-4 shrink-0" />
            {contact_email}
          </a>
        )}
        {contact_phone && (
          <p className="flex items-center gap-2 text-foreground">
            <PhoneIcon className="size-4 shrink-0 text-muted-foreground" />
            {contact_phone}
          </p>
        )}
      </div>
    </div>
  );
}
