-- =========================================================
-- ConsultFlow — projects + consultant<->project assignments
--
-- Surfaced by the real consultant register the user provided: consultants
-- are each engaged on one or more named, reused projects (e.g. "RGS",
-- "HORIZON", "VILLANOVA P1") — a genuine many-to-many, distinct from
-- `regions` (which is about license-to-operate geography, not project
-- engagement). Modeled as a real table + join rather than a text[] column
-- so project names can't drift via typos and this can later back the
-- project-specific scoring template phase.
-- =========================================================

create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Case-insensitive uniqueness (not a plain unique constraint on `name`) so
-- "RGS" and "rgs" typed on different consultants resolve to the same
-- project instead of silently creating a near-duplicate.
create unique index projects_name_lower_idx on public.projects (lower(name));

create table public.consultant_projects (
  consultant_id  uuid not null references public.consultants(id) on delete cascade,
  project_id     uuid not null references public.projects(id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (consultant_id, project_id)
);

create index consultant_projects_project_idx on public.consultant_projects (project_id);

comment on table public.consultant_projects is 'Which projects a consultant is/was engaged on. Rows are fully replaced (delete + re-insert) on each consultant edit rather than diffed, same approach as the disciplines/regions arrays.';

alter table public.projects enable row level security;
alter table public.consultant_projects enable row level security;

-- Both roles read (needed to show project assignments anywhere they're
-- displayed); only admin writes, matching consultants itself. New
-- projects are created implicitly by the admin-only consultant create/edit
-- Server Actions (lookup-or-create by name), not a standalone admin UI yet.
create policy projects_select_authenticated on public.projects for select
  using (public.is_active_profile());

create policy projects_insert_admin on public.projects for insert
  with check (public.is_admin());

create policy projects_update_admin on public.projects for update
  using (public.is_admin()) with check (public.is_admin());

create policy consultant_projects_select_authenticated on public.consultant_projects for select
  using (public.is_active_profile());

create policy consultant_projects_insert_admin on public.consultant_projects for insert
  with check (public.is_admin());

create policy consultant_projects_delete_admin on public.consultant_projects for delete
  using (public.is_admin());
