-- =========================================================
-- ConsultFlow — core schema
--
-- Phase 1 (the shipped, in-use feature set) is the consultants table plus
-- the feedback_reviews table in migration 0003. The checklist tables below
-- (checklist_item_defs, consultant_checklist_items) are schema-only for
-- now — no UI reads/writes them yet; that's a later phase.
-- =========================================================

-- ---------- extensions ----------
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ---------- enums ----------
create type public.app_role as enum ('admin', 'project_lead');
-- extensible: add more values later via `alter type public.app_role add value '...'`

create type public.consultant_status as enum ('pending_review', 'approved', 'rejected', 'suspended');

create type public.consultant_tier as enum ('tier_1', 'tier_2', 'tier_3', 'unrated');

create type public.checklist_status as enum ('not_submitted', 'submitted', 'verified', 'rejected', 'expired');

-- ---------- profiles (internal users; 1:1 with auth.users) ----------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  role         public.app_role not null default 'project_lead',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.profiles is 'One row per internal (Microsoft 365 SSO) user. External consultants never get a row here — a future phase reaches them via a magic-link/token mechanism (for self-service certification submission) rather than a Supabase Auth account.';

-- ---------- consultants (master list) ----------
create table public.consultants (
  id                uuid primary key default gen_random_uuid(),
  company_name      text not null,
  contact_name      text,
  discipline        text not null,                 -- e.g. 'Structural Engineering', 'MEP', 'Architecture'
  contact_email     text not null,
  contact_phone     text,
  regions           text[] not null default '{}',  -- e.g. '{UAE, KSA, Qatar}'
  status            public.consultant_status not null default 'pending_review',
  tier              public.consultant_tier not null default 'unrated',
  notes             text,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index consultants_discipline_idx on public.consultants (discipline);
create index consultants_status_idx on public.consultants (status);
create index consultants_regions_gin_idx on public.consultants using gin (regions);

comment on column public.consultants.tier is 'For now: manually set, defaults to unrated. Future phase: derived/overridden by pre-screening scoring_criteria results.';

-- ---------- checklist item definitions (reference table, not an enum) ----------
create table public.checklist_item_defs (
  id                  uuid primary key default gen_random_uuid(),
  code                text unique not null,   -- stable machine key, e.g. 'prof_certification'
  label               text not null,
  description         text,
  requires_document   boolean not null default true,
  requires_expiry     boolean not null default false,
  sort_order          int not null default 0,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);
comment on table public.checklist_item_defs is 'Fixed list for now (seeded below, not editable via the UI), modeled as data so a future admin-configurable checklist is a data change, not a schema change.';

insert into public.checklist_item_defs (code, label, description, requires_document, requires_expiry, sort_order) values
  ('prof_certification', 'Professional certification / license', 'Current professional certification or license relevant to the consultant''s discipline.', true, false, 10),
  ('proof_experience',   'Proof of relevant experience (CV/project history)', 'CV or project history demonstrating relevant experience.', true, false, 20),
  ('revit_license',      'Revit license proof', 'Evidence of a valid Revit license.', true, false, 30),
  ('acc_license',        'ACC (Autodesk Construction Cloud) license proof', 'Evidence of a valid ACC license.', true, false, 40),
  ('pi_insurance',       'PI insurance certificate', 'Professional Indemnity insurance certificate, with expiry date.', true, true, 50),
  ('region_license',     'Region/jurisdiction operating license', 'License to operate in the relevant region/jurisdiction, with expiry date.', true, true, 60);

-- ---------- per-consultant checklist completion records ----------
create table public.consultant_checklist_items (
  id                  uuid primary key default gen_random_uuid(),
  consultant_id       uuid not null references public.consultants(id) on delete cascade,
  checklist_item_id   uuid not null references public.checklist_item_defs(id),
  status              public.checklist_status not null default 'not_submitted',
  document_path       text,              -- Supabase Storage object path, e.g. 'consultant-docs/<consultant_id>/<item_code>/<uuid>-<filename>'
  expiry_date         date,              -- only meaningful when checklist_item_defs.requires_expiry is true
  submitted_at        timestamptz,
  verified_by         uuid references public.profiles(id),
  verified_at         timestamptz,
  rejection_reason    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (consultant_id, checklist_item_id)
);
create index cci_consultant_idx on public.consultant_checklist_items (consultant_id);
create index cci_expiry_idx on public.consultant_checklist_items (expiry_date) where expiry_date is not null;

comment on table public.consultant_checklist_items is 'One row per (consultant, checklist item). expiry_date populated only for pi_insurance and region_license today. cci_expiry_idx supports a future-phase job that scans for soon-to-expire items and emails reminders.';

-- ---------- updated_at triggers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_consultants_updated_at before update on public.consultants
  for each row execute function public.set_updated_at();
create trigger trg_cci_updated_at before update on public.consultant_checklist_items
  for each row execute function public.set_updated_at();
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- auto-create profile row on new auth user (Microsoft 365 SSO) ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'project_lead')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

comment on function public.handle_new_user is 'New users default to project_lead (least privilege). An admin must manually promote a profile to admin via direct SQL/Supabase dashboard for now — no self-service role escalation UI.';

-- =========================================================
-- FUTURE-PHASE HOOKS (not created now — noted for forward-compatibility)
-- =========================================================
-- scoring_criteria(id, code, label, weight_type, ...)             -- pre-screening criteria definitions (cost, Revit license, PI insurance level, region experience, etc.)
-- consultant_scores(consultant_id, criteria_id, value/score)      -- per-consultant raw scores against each criterion
-- project_scoring_templates(id, project_id, criteria_id, weight)  -- project-specific weighting of scoring_criteria
-- project_consultant_rankings(project_id, consultant_id, computed_score) -- derived "best fit" ranking per project
-- consultant_access_tokens(id, consultant_id, token_hash, expires_at, used_at, created_by) -- magic-link self-service auth, NOT tied to auth.users
-- (Post-project feedback reviews are already built — see migration 0003_feedback_reviews.sql.)
-- All of the above reference consultants.id / profiles.id, which already exist — this schema does not need to change to accommodate them.
