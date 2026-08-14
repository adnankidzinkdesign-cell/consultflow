"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { devAuth } from "@/lib/actions/dev-auth";

/**
 * Local-only email/password sign-in, rendered by the login page only when
 * NODE_ENV !== "production" (see lib/actions/dev-auth.ts for why that's
 * safe). Exists so ConsultFlow can be tested before Azure/Entra ID
 * approval comes through — not a security shortcut, just a different way
 * to get a real Supabase session locally.
 */
export function DevAuthForm() {
  const [state, formAction, pending] = useActionState(devAuth, { error: null });

  return (
    <div className="space-y-3 rounded-md border border-dashed border-border p-4">
      <p className="text-xs font-medium text-muted-foreground">
        Dev sign-in (local only — never shown in production)
      </p>

      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {state.error}
        </p>
      )}

      <form action={formAction} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="dev-email" className="text-xs">
            Email
          </Label>
          <Input id="dev-email" name="email" type="email" required autoComplete="username" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dev-password" className="text-xs">
            Password
          </Label>
          <Input
            id="dev-password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            name="intent"
            value="sign_up"
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={pending}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign up
          </Button>
          <Button
            type="submit"
            name="intent"
            value="sign_in"
            variant="secondary"
            size="sm"
            className="flex-1"
            disabled={pending}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </div>
      </form>

      <p className="text-xs text-muted-foreground">
        First time: sign up with any email/password, then promote yourself to
        admin via the Supabase SQL editor (see README).
      </p>
    </div>
  );
}
