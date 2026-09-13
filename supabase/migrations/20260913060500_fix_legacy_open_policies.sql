-- SECURITY FIX: the 2025-09-04 migration that was supposed to replace
-- permissive "Anyone can ..." policies on news/activities (and tighten
-- media_resources to owner-or-admin) never actually ran against this
-- live database — confirmed on 2026-09-13 by testing that anonymous,
-- logged-out requests could INSERT into both `news` and `activities`.
-- This drops every policy name either table has ever had across the
-- migration history, then re-creates only the intended owner-or-admin
-- policies, so no old permissive policy is left active alongside them.

-- Remove the leftover test row created while diagnosing this bug.
DELETE FROM public.activities WHERE title = 'sec-check';

-- NEWS
DROP POLICY IF EXISTS "Anyone can create news" ON public.news;
DROP POLICY IF EXISTS "Anyone can update news" ON public.news;
DROP POLICY IF EXISTS "Anyone can delete news" ON public.news;
DROP POLICY IF EXISTS "Only admins can create news" ON public.news;
DROP POLICY IF EXISTS "Admins can update news" ON public.news;
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
DROP POLICY IF EXISTS "Only teachers can create news" ON public.news;
DROP POLICY IF EXISTS "Only teachers can update news" ON public.news;
DROP POLICY IF EXISTS "Only teachers can delete news" ON public.news;
DROP POLICY IF EXISTS "Staff can create news" ON public.news;
DROP POLICY IF EXISTS "Uploader or admin can update news" ON public.news;
DROP POLICY IF EXISTS "Uploader or admin can delete news" ON public.news;

CREATE POLICY "Staff can create news"
  ON public.news FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.can_access_dashboard());

CREATE POLICY "Uploader or admin can update news"
  ON public.news FOR UPDATE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

CREATE POLICY "Uploader or admin can delete news"
  ON public.news FOR DELETE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

-- ACTIVITIES
DROP POLICY IF EXISTS "Anyone can create activities" ON public.activities;
DROP POLICY IF EXISTS "Anyone can update activities" ON public.activities;
DROP POLICY IF EXISTS "Anyone can delete activities" ON public.activities;
DROP POLICY IF EXISTS "Only admins can delete activities" ON public.activities;
DROP POLICY IF EXISTS "Only teachers can create activities" ON public.activities;
DROP POLICY IF EXISTS "Only teachers can update activities" ON public.activities;
DROP POLICY IF EXISTS "Staff can create activities" ON public.activities;
DROP POLICY IF EXISTS "Uploader or admin can update activities" ON public.activities;
DROP POLICY IF EXISTS "Uploader or admin can delete activities" ON public.activities;

CREATE POLICY "Staff can create activities"
  ON public.activities FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.can_access_dashboard());

CREATE POLICY "Uploader or admin can update activities"
  ON public.activities FOR UPDATE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

CREATE POLICY "Uploader or admin can delete activities"
  ON public.activities FOR DELETE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

-- MEDIA RESOURCES (previously only required being logged in, not
-- ownership — any authenticated account could edit/delete anyone's media)
DROP POLICY IF EXISTS "Authenticated users can create media resources" ON public.media_resources;
DROP POLICY IF EXISTS "Authenticated users can update media resources" ON public.media_resources;
DROP POLICY IF EXISTS "Authenticated users can delete media resources" ON public.media_resources;
DROP POLICY IF EXISTS "Only teachers can create media resources" ON public.media_resources;
DROP POLICY IF EXISTS "Users can update their own media or admins can update any" ON public.media_resources;
DROP POLICY IF EXISTS "Users can delete their own media or admins can delete any" ON public.media_resources;
DROP POLICY IF EXISTS "Staff can create media resources" ON public.media_resources;
DROP POLICY IF EXISTS "Uploader or admin can update media resources" ON public.media_resources;
DROP POLICY IF EXISTS "Uploader or admin can delete media resources" ON public.media_resources;

CREATE POLICY "Staff can create media resources"
  ON public.media_resources FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.can_access_dashboard());

CREATE POLICY "Uploader or admin can update media resources"
  ON public.media_resources FOR UPDATE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

CREATE POLICY "Uploader or admin can delete media resources"
  ON public.media_resources FOR DELETE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));
