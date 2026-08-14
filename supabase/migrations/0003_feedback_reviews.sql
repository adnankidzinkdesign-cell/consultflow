-- =========================================================
-- ConsultFlow — Post-project feedback / review form
--
-- Google-review-style scoring, filled in by a project lead (or admin) at
-- the end of a project: five 1-5 star categories, a blacklist flag, and
-- free-text comments. There is no `projects` table yet (that's a later
-- phase), so `project_name` is free text for now — a future migration can
-- add a `project_id` FK once projects are modeled, without touching the
-- rating columns.
-- =========================================================

create table public.feedback_reviews (
  id                        uuid primary key default gen_random_uuid(),
  consultant_id             uuid not null references public.consultants(id) on delete cascade,
  reviewer_id               uuid not null references public.profiles(id),
  project_name              text,
  technical_competence      smallint not null check (technical_competence between 1 and 5),
  quality_of_deliverables   smallint not null check (quality_of_deliverables between 1 and 5),
  programme_reliability     smallint not null check (programme_reliability between 1 and 5),
  communication             smallint not null check (communication between 1 and 5),
  commercial_value          smallint not null check (commercial_value between 1 and 5),
  blacklist                 boolean not null default false,
  comments                  text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index feedback_reviews_consultant_idx on public.feedback_reviews (consultant_id);
create index feedback_reviews_blacklist_idx on public.feedback_reviews (consultant_id) where blacklist;

comment on table public.feedback_reviews is 'One row per post-project review. A consultant with any blacklist=true row is treated as blacklisted in the UI — there is no separate blacklist flag on consultants itself, so the reason/history is always traceable to a specific review.';

create trigger trg_feedback_reviews_updated_at before update on public.feedback_reviews
  for each row execute function public.set_updated_at();

alter table public.feedback_reviews enable row level security;

-- Both roles can read all reviews (needed to see a consultant's track
-- record, including blacklist status, before assigning them to a project).
create policy feedback_select_authenticated on public.feedback_reviews for select
  using (public.is_active_profile());

-- Both admin and project_lead can leave a review (the email's stated
-- process is "undertaken by project lead", but admins commonly need to
-- record one too). The reviewer must be the authenticated user themselves
-- — no submitting a review on someone else's behalf.
create policy feedback_insert_authenticated on public.feedback_reviews for insert
  with check (public.is_active_profile() and reviewer_id = auth.uid());

-- A reviewer can correct their own review; admins can correct any.
create policy feedback_update_own_or_admin on public.feedback_reviews for update
  using (reviewer_id = auth.uid() or public.is_admin())
  with check (reviewer_id = auth.uid() or public.is_admin());

-- Only admins can delete a review outright.
create policy feedback_delete_admin on public.feedback_reviews for delete
  using (public.is_admin());
