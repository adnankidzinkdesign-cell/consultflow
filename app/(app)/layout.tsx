import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/getSessionProfile";
import { AppHeader } from "@/components/consultflow/app-header";
import { Toaster } from "@/components/ui/sonner";

/**
 * Server-side gate for everything under (app). Middleware already redirects
 * unauthenticated visitors to /login; this additionally handles the case of
 * a valid Microsoft session with no active ConsultFlow profile (e.g. an
 * account an admin has deactivated) by sending them to /unauthorized
 * instead of silently rendering nothing.
 *
 * This check is a UX convenience — the real authorization boundary is the
 * Row Level Security policies applied to every query these pages make.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
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
      <Toaster />
    </div>
  );
}
