import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { Button, TopNavbar, TopNavbarSection } from "@kidzink/ui";
import { ThemeToggle } from "@/components/consultflow/theme-toggle";
import { UserAvatar } from "@/components/consultflow/user-avatar";
import type { SessionProfile } from "@/lib/auth/getSessionProfile";

const ROLE_LABELS: Record<SessionProfile["role"], string> = {
  admin: "Admin",
  project_lead: "Project Lead",
};

export function AppHeader({ profile }: { profile: SessionProfile }) {
  return (
    <header className="border-b border-border bg-card">
      {/* TopNavbar's own border/bg are cancelled here since the outer
          <header> already provides the full-bleed border/background —
          this inner element only supplies the centered max-w-6xl row. */}
      <TopNavbar className="mx-auto h-16 max-w-6xl border-b-0 bg-transparent px-4 py-0 sm:px-6">
        <TopNavbarSection>
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
        </TopNavbarSection>

        <TopNavbarSection className="gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar name={profile.fullName ?? profile.email} />
            <div className="text-sm leading-tight">
              <p className="font-medium text-foreground">
                {profile.fullName ?? profile.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {ROLE_LABELS[profile.role]}
              </p>
            </div>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
          <ThemeToggle />
        </TopNavbarSection>
      </TopNavbar>
    </header>
  );
}
