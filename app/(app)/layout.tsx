import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import { AppHeader } from "@/components/consultflow/app-header";
import { ModalSlot } from "@/components/consultflow/modal-slot";
import { Toaster } from "@/components/ui/sonner";

/**
 * Server-side gate for everything under (app). Middleware already redirects
 * unauthenticated visitors to kidzink-auth's /login; this additionally
 * handles the case of a valid shared session with no active ConsultFlow
 * profile, or without kidzink-auth app access to consultflow (see
 * getSessionProfile.ts), by sending them to /unauthorized instead of
 * silently rendering nothing.
 *
 * This check (plus each server action's own checks) IS the real
 * authorization boundary — not Row Level Security. consultflow's own
 * project can't resolve auth.uid() for a kidzink-auth-issued session, so
 * RLS no longer applies to anything queried through lib/supabase/server.ts.
 */
export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const profile = await getSessionProfile();

  if (!profile) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <ModalSlot>{modal}</ModalSlot>
      <Toaster />
    </div>
  );
}
