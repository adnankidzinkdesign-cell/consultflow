-- =========================================================
-- ConsultFlow — contact_email is no longer required
--
-- The real consultant register the user is entering data from doesn't
-- include contact emails per consultant (it's a services/projects
-- register, not a contacts database) — contact info gets added later as
-- it's obtained, rather than blocking initial data entry on it.
-- =========================================================

alter table public.consultants alter column contact_email drop not null;
