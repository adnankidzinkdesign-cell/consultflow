-- =========================================================
-- ConsultFlow — consultants.discipline -> disciplines (multi-value)
--
-- Lets one consultant company be listed once under multiple disciplines/
-- services (e.g. "Structural Engineering", "MEP") instead of needing a
-- duplicate consultant row per discipline — matching how `regions`
-- already works as a text[] column.
-- =========================================================

alter table public.consultants add column disciplines text[] not null default '{}';

update public.consultants set disciplines = array[discipline];

alter table public.consultants drop column discipline;

-- Enforced only after the backfill above, so existing rows (which always
-- had a non-null discipline) are guaranteed to already satisfy it.
alter table public.consultants
  add constraint consultants_disciplines_not_empty check (array_length(disciplines, 1) > 0);

drop index if exists consultants_discipline_idx;
create index consultants_disciplines_gin_idx on public.consultants using gin (disciplines);

comment on column public.consultants.disciplines is 'One or more disciplines/services this consultant offers (e.g. Structural Engineering, MEP) — lets one company appear once with multiple disciplines rather than as duplicate rows.';
