-- Student registry: every approved staff account can READ (view-only);
-- adding / editing needs admin or the "students_system" menu permission;
-- deleting stays admin-only. Supersedes the SELECT rule from 20261005120000.
DROP POLICY IF EXISTS "Approved can read students" ON public.students;
DROP POLICY IF EXISTS "Staff can read students" ON public.students;
CREATE POLICY "Staff can read students"
  ON public.students FOR SELECT
  USING (public.can_access_dashboard());
