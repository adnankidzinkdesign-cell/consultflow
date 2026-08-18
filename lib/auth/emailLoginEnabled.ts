/**
 * Whether the email/password sign-in path is allowed to run at all.
 *
 * On by default in local dev. In a deployed (production) build it's off
 * unless ENABLE_EMAIL_LOGIN=true is set in the environment — a temporary
 * override for letting someone without a KidzInk Microsoft 365 account
 * (e.g. a designer reviewing the UI) sign in before Entra ID SSO is set up
 * for them. See README for how to turn it off again once it's no longer
 * needed.
 *
 * Lives outside lib/actions/dev-auth.ts (a "use server" file) because
 * Server Action files may only export async functions — this is a plain
 * sync helper shared by that action and the login page.
 */
export function isEmailLoginEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_EMAIL_LOGIN === "true";
}
