-- =========================================================
-- ConsultFlow — feedback_reviews.regions
--
-- Lets a review record which of the consultant's regions the feedback
-- actually applies to — mirrors disciplines (0007_feedback_review_disciplines),
-- except no not-empty constraint: consultants.regions itself is allowed to
-- be empty (not every consultant has a region on file), so a review of such
-- a consultant naturally can't have any region to choose from either.
-- =========================================================

alter table public.feedback_reviews add column regions text[] not null default '{}';

-- Backfill existing reviews with the consultant's current region list —
-- the best available guess for reviews written before this column existed.
update public.feedback_reviews fr
set regions = c.regions
from public.consultants c
where c.id = fr.consultant_id and fr.regions = '{}';

create index feedback_reviews_regions_gin_idx on public.feedback_reviews using gin (regions);

comment on column public.feedback_reviews.regions is 'Which of the consultant''s regions this review covers — a subset of consultants.regions, chosen per review. Unlike disciplines, not required to be non-empty since consultants.regions itself may be empty.';
