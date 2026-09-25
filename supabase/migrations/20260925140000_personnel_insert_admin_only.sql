-- Only admins may add new people to the personnel list.
-- Editing/deleting stays "uploader or admin" (see 20260913045318).
DROP POLICY IF EXISTS "Staff can create personnel" ON public.personnel;
DROP POLICY IF EXISTS "Admins can create personnel" ON public.personnel;
CREATE POLICY "Admins can create personnel"
  ON public.personnel FOR INSERT
  WITH CHECK (public.is_admin());
