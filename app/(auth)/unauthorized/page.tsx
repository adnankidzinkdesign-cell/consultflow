import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">No access</h1>
        <p className="text-sm text-muted-foreground">
          Your Microsoft account signed in successfully, but you don&apos;t have
          an active ConsultFlow profile. Contact an admin to get access.
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline" className="w-full">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
