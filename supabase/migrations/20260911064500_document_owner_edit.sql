-- Only the document's own uploader (or an admin) may edit or delete it.
-- documents.user_id already exists (defaults to auth.uid() on insert).

DROP POLICY IF EXISTS "Staff can insert documents" ON public.documents;
CREATE POLICY "Staff can insert documents"
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'teacher') AND approved = true
    )
  );

DROP POLICY IF EXISTS "Staff can update documents" ON public.documents;
CREATE POLICY "Uploader or admin can update documents"
  ON public.documents FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'teacher') AND approved = true
      )
    )
  );

DROP POLICY IF EXISTS "Staff can delete documents" ON public.documents;
CREATE POLICY "Uploader or admin can delete documents"
  ON public.documents FOR DELETE TO authenticated
  USING (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('admin', 'teacher') AND approved = true
      )
    )
  );
