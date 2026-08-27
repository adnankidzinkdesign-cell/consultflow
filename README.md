# ConsultFlow

KidzInk/KODA internal tool for consultant screening, review, and onboarding. Currently ships **Phase 1**: the consultant master list and the post-project feedback/review form (star ratings + blacklist). The mandatory certification checklist, pre-screening scoring, and a consultant self-service portal (a web link for consultants to submit their own certs, with license-expiry email reminders) are later phases — see `supabase/migrations/0001_init.sql` for the schema hooks already reserved for them.

Stack: **Next.js (App Router)** on **Netlify**, **Supabase** (Postgres, Auth, Storage), **Tailwind + shadcn/ui**. Sign-in itself is handled by **kidzink-auth** (`D:\codebase\kidzink-auth`), KidzInk's shared sign-in service — see its README for Microsoft 365/Entra ID setup and inviting people. This app only reads the session it produces.

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com) for consultflow's own business data (consultants, feedback_reviews, profiles, ...). This is separate from kidzink-auth's own project, which handles identity.
2. Note the project URL, publishable key, and secret key (Project Settings → API Keys).

### 2. Sign-in (kidzink-auth)

ConsultFlow doesn't run its own login — it redirects to kidzink-auth and reads the shared session it leaves behind (see `lib/supabase/auth-server.ts`, `lib/supabase/middleware.ts`). Set `NEXT_PUBLIC_AUTH_SUPABASE_URL` / `NEXT_PUBLIC_AUTH_SUPABASE_PUBLISHABLE_KEY` to kidzink-auth's Supabase project, and `NEXT_PUBLIC_KIDZINK_AUTH_URL` to wherever kidzink-auth is deployed/running. See kidzink-auth's own README for setting up Microsoft 365/Entra ID sign-in and inviting people.

A brand-new sign-in gets a `profiles` row here automatically (`lib/auth/getOrCreateProfile.ts`, replacing the old local `handle_new_user` trigger) with the least-privileged `project_lead` role — see "Promote the first admin" below.

### 3. Storage bucket

Create a bucket named `consultant-docs`. **Public = false.** (Reserved for the future certification-document upload phase — RLS policies for it already exist in `supabase/migrations/0002_rls.sql`.)

### 4. Local development

kidzink-auth needs to be running too — locally that means its own local Supabase instance rather than a hosted project (see its README):

```bash
# in D:\codebase\kidzink-auth
npx supabase start                 # local Postgres + GoTrue; note the URL/anon key it prints
npm run dev -- -p 3001
```

Then, in consultflow itself:

```bash
npm install
cp .env.local.example .env.local   # fill in the values, incl. NEXT_PUBLIC_AUTH_SUPABASE_* from the step above
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
2. Add the same env vars from `.env.local.example` in Site settings → Environment variables (use your production Supabase project's values, kidzink-auth's real deployed URL for `NEXT_PUBLIC_KIDZINK_AUTH_URL`, and your Netlify URL for `NEXT_PUBLIC_SITE_URL`). Add this site's URL to kidzink-auth's own `ALLOWED_RETURN_ORIGINS`.
3. Deploy, sign in via kidzink-auth with a KidzInk Microsoft 365 account, and promote yourself to admin as above.

## Roles

- **admin** (HR/Admin) — full read/write: add/edit consultants, manage the checklist (future phase).
- **project_lead** — read the consultant list, leave post-project feedback reviews. Cannot add/edit consultants.

Row Level Security enforces this at the database level (`supabase/migrations/0002_rls.sql`, `0003_feedback_reviews.sql`) — UI-level role checks are a convenience layer on top, not the actual boundary.

## Project structure

```
app/(auth)/unauthorized                              — signed in via kidzink-auth, but no active profile here
app/(app)/layout.tsx                                 — session/profile gate for everything below
app/(app)/consultants/...                            — list, add, edit, detail, reviews
lib/supabase/{server,client,admin}.ts                — business-data Supabase client wiring
lib/supabase/{auth-server,auth-client,auth-cookie-options}.ts — kidzink-auth's project, identity only
lib/auth/{getSessionProfile,getOrCreateProfile}.ts   — shared session -> this app's `profiles` row
lib/actions/                                         — Server Actions (consultants, feedback, auth)
supabase/migrations/                                 — schema + RLS, source of truth for the database
```
