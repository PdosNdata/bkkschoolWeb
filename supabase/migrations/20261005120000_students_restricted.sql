-- Student registry: only admins or accounts an admin approved (menu permission
-- "students_system") may read/write. The OMR checker ("omr_system") may read
-- it so it can show names for scanned student codes.

CREATE OR REPLACE FUNCTION public.has_menu_permission(_permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1
    FROM public.user_permissions up
    WHERE up.user_id = auth.uid()
      AND up.permission_name = _permission
      AND up.granted = true
  );
$$;

DROP POLICY IF EXISTS "Staff can read students" ON public.students;
DROP POLICY IF EXISTS "Approved can read students" ON public.students;
CREATE POLICY "Approved can read students"
  ON public.students FOR SELECT
  USING (
    public.can_access_dashboard()
    AND (public.has_menu_permission('students_system') OR public.has_menu_permission('omr_system'))
  );

DROP POLICY IF EXISTS "Staff can add students" ON public.students;
DROP POLICY IF EXISTS "Approved can add students" ON public.students;
CREATE POLICY "Approved can add students"
  ON public.students FOR INSERT
  WITH CHECK (public.can_access_dashboard() AND public.has_menu_permission('students_system'));

DROP POLICY IF EXISTS "Staff can update students" ON public.students;
DROP POLICY IF EXISTS "Approved can update students" ON public.students;
CREATE POLICY "Approved can update students"
  ON public.students FOR UPDATE
  USING (public.can_access_dashboard() AND public.has_menu_permission('students_system'))
  WITH CHECK (public.can_access_dashboard() AND public.has_menu_permission('students_system'));
-- "Admin can delete students" is unchanged (admin only).
