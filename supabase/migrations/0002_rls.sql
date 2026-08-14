-- =========================================================
-- ConsultFlow — Row Level Security
--
-- Every table has RLS enabled with no anonymous/public access. These
-- policies are the actual authorization boundary for the app — UI-level
-- role checks (hiding buttons for non-admins) are a UX nicety on top of
-- this, never a substitute for it.
-- =========================================================

alter table public.profiles enable row level security;
alter table public.consultants enable row level security;
alter table public.checklist_item_defs enable row level security;
alter table public.consultant_checklist_items enable row level security;

-- ---------- helper functions ----------
-- security definer + fixed search_path so these can be called from policies
-- without re-triggering RLS on `profiles` (which would recurse).

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_active
  );
$$;

create or replace function public.is_active_profile()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active);
$$;

-- ---------- profiles ----------
-- Any active internal user can read the (small, low-sensitivity) profile
-- directory — needed so e.g. a project_lead can see who verified a
-- checklist item or authored a review, not just admins. Only admins write.
-- No insert policy: rows are created only by the handle_new_user trigger,
-- which runs as security definer and bypasses RLS.

create policy profiles_select_authenticated on public.profiles for select
  using (public.is_active_profile());

create policy profiles_update_admin_only on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- ---------- consultants ----------
-- Both roles read; only admin writes to the consultants table itself.
-- project_lead's write access is scoped to feedback_reviews instead (see
-- migration 0003) — a project_lead records reviews there, not by editing
-- the consultant record directly.

create policy consultants_select_authenticated on public.consultants for select
  using (public.is_active_profile());

create policy consultants_insert_admin on public.consultants for insert
  with check (public.is_admin());

create policy consultants_update_admin on public.consultants for update
  using (public.is_admin()) with check (public.is_admin());

create policy consultants_delete_admin on public.consultants for delete
  using (public.is_admin());

-- ---------- checklist_item_defs ----------
-- Read-only reference data for all authenticated users; admin-only writes
-- (not exposed in the UI yet, but the policy is ready for when it is).

create policy checklist_defs_select_authenticated on public.checklist_item_defs for select
  using (public.is_active_profile());

create policy checklist_defs_write_admin on public.checklist_item_defs for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- consultant_checklist_items ----------
-- Both roles read; only admin inserts/updates (submits documents on a
-- consultant's behalf and verifies/rejects them).

create policy cci_select_authenticated on public.consultant_checklist_items for select
  using (public.is_active_profile());

create policy cci_insert_admin on public.consultant_checklist_items for insert
  with check (public.is_admin());

create policy cci_update_admin on public.consultant_checklist_items for update
  using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- Storage: private `consultant-docs` bucket
--
-- Create the bucket itself via the Supabase dashboard/CLI with
-- `public = false` (see README setup steps) — this migration only adds
-- the RLS policies on storage.objects for that bucket.
-- =========================================================

create policy docs_select_authenticated on storage.objects for select
  using (bucket_id = 'consultant-docs' and public.is_active_profile());

create policy docs_insert_admin on storage.objects for insert
  with check (bucket_id = 'consultant-docs' and public.is_admin());

create policy docs_update_admin on storage.objects for update
  using (bucket_id = 'consultant-docs' and public.is_admin())
  with check (bucket_id = 'consultant-docs' and public.is_admin());

create policy docs_delete_admin on storage.objects for delete
  using (bucket_id = 'consultant-docs' and public.is_admin());
