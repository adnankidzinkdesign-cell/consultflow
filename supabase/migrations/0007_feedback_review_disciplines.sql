-- =========================================================
-- ConsultFlow — feedback_reviews.disciplines
--
-- Lets a review record which of the consultant's disciplines the feedback
-- actually applies to — a multi-discipline consultant (e.g. Structural
-- Engineering + MEP) may only have performed one of those services on a
-- given project, so the review shouldn't be assumed to cover every
-- discipline the consultant offers.
-- =========================================================

alter table public.feedback_reviews add column disciplines text[] not null default '{}';

-- Backfill existing reviews with the consultant's full discipline list —
-- the best available guess for reviews written before this column existed.
update public.feedback_reviews fr
set disciplines = c.disciplines
from public.consultants c
where c.id = fr.consultant_id and fr.disciplines = '{}';

-- Enforced only after the backfill above, so existing rows are guaranteed
-- to already satisfy it (mirrors consultants_disciplines_not_empty in
-- 0004_disciplines_array.sql).
alter table public.feedback_reviews
  add constraint feedback_reviews_disciplines_not_empty check (array_length(disciplines, 1) > 0);

create index feedback_reviews_disciplines_gin_idx on public.feedback_reviews using gin (disciplines);

comment on column public.feedback_reviews.disciplines is 'Which of the consultant''s disciplines this review covers — a subset of consultants.disciplines, chosen per review since a multi-discipline consultant may only be assessed for the service performed on a given project.';
