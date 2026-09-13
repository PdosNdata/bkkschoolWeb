-- Apply the same "uploader or admin only" edit/delete rule already used
-- for public.documents to news, activities, media_resources and personnel.
-- Existing rows predate ownership tracking, so their user_id stays NULL
-- until an admin edits them (or the site owner) — only an admin can
-- manage those until then, which is the safe default.

-- ── NEWS ─────────────────────────────────────────────────────────────
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

DROP POLICY IF EXISTS "Only teachers can create news" ON public.news;
DROP POLICY IF EXISTS "Only teachers can update news" ON public.news;
DROP POLICY IF EXISTS "Only teachers can delete news" ON public.news;

CREATE POLICY "Staff can create news"
  ON public.news FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.can_access_dashboard());

CREATE POLICY "Uploader or admin can update news"
  ON public.news FOR UPDATE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

CREATE POLICY "Uploader or admin can delete news"
  ON public.news FOR DELETE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

-- ── ACTIVITIES ───────────────────────────────────────────────────────
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

DROP POLICY IF EXISTS "Only teachers can create activities" ON public.activities;
DROP POLICY IF EXISTS "Only teachers can update activities" ON public.activities;
DROP POLICY IF EXISTS "Only admins can delete activities" ON public.activities;

CREATE POLICY "Staff can create activities"
  ON public.activities FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.can_access_dashboard());

CREATE POLICY "Uploader or admin can update activities"
  ON public.activities FOR UPDATE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

CREATE POLICY "Uploader or admin can delete activities"
  ON public.activities FOR DELETE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

-- ── MEDIA RESOURCES ──────────────────────────────────────────────────
ALTER TABLE public.media_resources ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

DROP POLICY IF EXISTS "Only teachers can create media resources" ON public.media_resources;
DROP POLICY IF EXISTS "Users can update their own media or admins can update any" ON public.media_resources;
DROP POLICY IF EXISTS "Users can delete their own media or admins can delete any" ON public.media_resources;

CREATE POLICY "Staff can create media resources"
  ON public.media_resources FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.can_access_dashboard());

CREATE POLICY "Uploader or admin can update media resources"
  ON public.media_resources FOR UPDATE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

CREATE POLICY "Uploader or admin can delete media resources"
  ON public.media_resources FOR DELETE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

-- ── PERSONNEL ────────────────────────────────────────────────────────
ALTER TABLE public.personnel ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

DROP POLICY IF EXISTS "Authenticated users can create personnel" ON public.personnel;
DROP POLICY IF EXISTS "Authenticated users can update personnel" ON public.personnel;
DROP POLICY IF EXISTS "Authenticated users can delete personnel" ON public.personnel;

CREATE POLICY "Staff can create personnel"
  ON public.personnel FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.can_access_dashboard());

CREATE POLICY "Uploader or admin can update personnel"
  ON public.personnel FOR UPDATE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

CREATE POLICY "Uploader or admin can delete personnel"
  ON public.personnel FOR DELETE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));
