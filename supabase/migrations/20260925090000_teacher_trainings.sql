-- Teacher training / meeting / seminar records (ระบบบุคลากร).
-- Records are publicly readable (each one has a shareable page with a
-- downloadable certificate); any approved teacher/admin can add a record,
-- only the person who added it or an admin can edit/delete it.

CREATE TABLE IF NOT EXISTS public.teacher_trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personnel_id uuid REFERENCES public.personnel(id) ON DELETE SET NULL,
  teacher_name text NOT NULL,
  report_date date NOT NULL DEFAULT current_date,
  title text NOT NULL,
  details text,
  organizer text,
  start_date date NOT NULL,
  end_date date,
  certificate_url text,
  certificate_name text,
  user_id uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_trainings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainings are publicly readable" ON public.teacher_trainings;
CREATE POLICY "Trainings are publicly readable"
  ON public.teacher_trainings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Staff can add trainings" ON public.teacher_trainings;
CREATE POLICY "Staff can add trainings"
  ON public.teacher_trainings FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.can_access_dashboard());

DROP POLICY IF EXISTS "Uploader or admin can update trainings" ON public.teacher_trainings;
CREATE POLICY "Uploader or admin can update trainings"
  ON public.teacher_trainings FOR UPDATE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

DROP POLICY IF EXISTS "Uploader or admin can delete trainings" ON public.teacher_trainings;
CREATE POLICY "Uploader or admin can delete trainings"
  ON public.teacher_trainings FOR DELETE
  USING (public.is_admin() OR (user_id = auth.uid() AND public.can_access_dashboard()));

DROP TRIGGER IF EXISTS update_teacher_trainings_updated_at ON public.teacher_trainings;
CREATE TRIGGER update_teacher_trainings_updated_at
  BEFORE UPDATE ON public.teacher_trainings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS teacher_trainings_start_date_idx ON public.teacher_trainings (start_date DESC);
CREATE INDEX IF NOT EXISTS teacher_trainings_personnel_idx ON public.teacher_trainings (personnel_id);
