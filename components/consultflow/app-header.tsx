import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/consultflow/theme-toggle";
import type { SessionProfile } from "@/lib/auth/getSessionProfile";

const ROLE_LABELS: Record<SessionProfile["role"], string> = {
  admin: "Admin",
  project_lead: "Project Lead",
};

export function AppHeader({ profile }: { profile: SessionProfile }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/consultants" className="flex items-center gap-3">
          <Image
            src="/brand/kidzink-logo.png"
            alt="KidzInk"
            width={120}
            height={26}
            className="h-6 w-auto"
          />
          <span className="text-sm font-semibold text-foreground">ConsultFlow</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm leading-tight">
            <p className="font-medium text-foreground">
              {profile.fullName ?? profile.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {ROLE_LABELS[profile.role]}
            </p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
