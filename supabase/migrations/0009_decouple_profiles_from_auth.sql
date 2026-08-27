-- =========================================================
-- ConsultFlow — decouple profiles from local auth.users
--
-- Identity now comes from kidzink-auth's own, separate Supabase project
-- (see lib/supabase/auth-server.ts) instead of Microsoft/email sign-in
-- happening directly against this project. profiles.id can no longer be a
-- foreign key into this project's auth.users — a signed-in user's id now
-- comes from a different project's auth schema entirely, one this
-- database has no visibility into.
--
-- lib/auth/getOrCreateProfile.ts replaces the old handle_new_user
-- trigger's job: on first sign-in it looks up a profile by id, falling
-- back to a case-insensitive email match (to re-key a profile created
-- before this switch, or re-invited under a new kidzink-auth id), and
-- only inserts a fresh row if neither is found.
-- =========================================================

-- ---------- profiles.id: no longer tied to this project's auth.users ----------
alter table public.profiles drop constraint profiles_id_fkey;
alter table public.profiles alter column id set default gen_random_uuid();

-- Case-insensitive uniqueness backs getOrCreateProfile's email fallback
-- lookup/re-key path.
create unique index profiles_email_unique_idx on public.profiles (lower(email));

-- ---------- retire the auth.users trigger ----------
-- Dead code now: real sign-ins no longer insert into this project's
-- auth.users, so this trigger will never fire for them again.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ---------- allow re-keying a profile's id (getOrCreateProfile's email fallback) ----------
-- Re-linking an existing profile to a new kidzink-auth id updates
-- profiles.id in place; without ON UPDATE CASCADE that would fail on any
-- row already referencing the old id.
alter table public.consultants
  drop constraint consultants_created_by_fkey,
  add constraint consultants_created_by_fkey
    foreign key (created_by) references public.profiles(id) on update cascade;

alter table public.consultant_checklist_items
  drop constraint consultant_checklist_items_verified_by_fkey,
  add constraint consultant_checklist_items_verified_by_fkey
    foreign key (verified_by) references public.profiles(id) on update cascade;

alter table public.feedback_reviews
  drop constraint feedback_reviews_reviewer_id_fkey,
  add constraint feedback_reviews_reviewer_id_fkey
    foreign key (reviewer_id) references public.profiles(id) on update cascade;
