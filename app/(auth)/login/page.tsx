import Image from "next/image";
import { signInWithAzure } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  domain:
    "That Microsoft account isn't part of the KidzInk organization. Sign in with your work account.",
  no_profile:
    "Your account signed in but has no ConsultFlow profile yet. Contact an admin.",
  oauth_failed: "Sign-in failed. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.oauth_failed) : null;

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src="/brand/kidzink-logo.png"
            alt="KidzInk"
            width={160}
            height={34}
            priority
            className="h-8 w-auto"
          />
          <div>
            <h1 className="text-lg font-semibold text-foreground">ConsultFlow</h1>
            <p className="text-sm text-muted-foreground">
              Consultant screening, review &amp; onboarding
            </p>
          </div>
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errorMessage}
          </p>
        )}

        <form action={signInWithAzure}>
          <input type="hidden" name="next" value={next ?? "/consultants"} />
          <Button type="submit" className="w-full" size="lg">
            Sign in with Microsoft
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Use your KidzInk Microsoft 365 work account.
        </p>
      </div>
    </div>
  );
}
