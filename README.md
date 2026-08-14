# ConsultFlow

KidzInk/KODA internal tool for consultant screening, review, and onboarding. Currently ships **Phase 1**: the consultant master list and the post-project feedback/review form (star ratings + blacklist). The mandatory certification checklist, pre-screening scoring, and a consultant self-service portal (a web link for consultants to submit their own certs, with license-expiry email reminders) are later phases — see `supabase/migrations/0001_init.sql` for the schema hooks already reserved for them.

Stack: **Next.js (App Router)** on **Netlify**, **Supabase** (Postgres, Auth, Storage), **Tailwind + shadcn/ui**, Microsoft 365 (Entra ID) SSO.

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Note the project URL, publishable key, and secret key (Project Settings → API Keys).

### 2. Microsoft 365 / Entra ID sign-in

ConsultFlow only supports signing in with a KidzInk Microsoft 365 work account — no email/password.

1. In [Entra ID (Azure AD) → App registrations](https://portal.azure.com), register a new app, **single-tenant** (accounts in this organizational directory only).
2. Add a client secret; note the **Application (client) ID**, the secret, and your **Directory (tenant) ID**.
3. Add a redirect URI (type: Web) — use the callback URL shown in Supabase under Authentication → Providers → Azure once you enable it (`https://<project-ref>.supabase.co/auth/v1/callback`).
4. In Supabase → Authentication → Providers → Azure: enable it, paste the client ID/secret, and set the provider URL to `https://login.microsoftonline.com/<tenant-id>/v2.0` (this scopes sign-in to your tenant — the IdP-level half of the tenant restriction).
5. In Supabase → Authentication → URL Configuration, add your Netlify site URL and `http://localhost:3000` to the redirect allow-list.
6. Set `ALLOWED_EMAIL_DOMAIN` (see below) — the app-level half of the tenant restriction, checked in `app/(auth)/auth/callback/route.ts`.

### 3. Storage bucket

Create a bucket named `consultant-docs`. **Public = false.** (Reserved for the future certification-document upload phase — RLS policies for it already exist in `supabase/migrations/0002_rls.sql`.)

### 4. Local development

```bash
npm install
cp .env.local.example .env.local   # fill in the values
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push               # applies supabase/migrations/*.sql to hosted Supabase
npm run dev
```

Every schema change is a new file under `supabase/migrations/`, committed to git and applied with `supabase db push` — never hand-edit the schema in the Supabase Studio UI for staging/prod.

### 5. Promote the first admin

New sign-ins default to the `project_lead` role (least privilege). Promote your own account once, via the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@kidzink.com';
```

There is intentionally no self-service "become admin" flow.

### 6. Deploy to Netlify

1. Create a Netlify site from this repo. `netlify.toml` already configures the build command, publish directory, and `@netlify/plugin-nextjs`.
2. Add the same env vars from `.env.local.example` in Site settings → Environment variables (use your production Supabase project's values and your Netlify URL for `NEXT_PUBLIC_SITE_URL`).
3. Deploy, sign in with a KidzInk Microsoft 365 account, and promote yourself to admin as above.

## Roles

- **admin** (HR/Admin) — full read/write: add/edit consultants, manage the checklist (future phase).
- **project_lead** — read the consultant list, leave post-project feedback reviews. Cannot add/edit consultants.

Row Level Security enforces this at the database level (`supabase/migrations/0002_rls.sql`, `0003_feedback_reviews.sql`) — UI-level role checks are a convenience layer on top, not the actual boundary.

## Project structure

```
app/(auth)/login, auth/callback, unauthorized   — sign-in flow
app/(app)/layout.tsx                            — session/profile gate for everything below
app/(app)/consultants/...                       — list, add, edit, detail, reviews
lib/supabase/{server,client,admin}.ts           — Supabase client wiring (see file comments for when to use which)
lib/actions/                                    — Server Actions (consultants, feedback, auth)
supabase/migrations/                            — schema + RLS, source of truth for the database
```
