-- Exam-score fields for OMR results, linked to the student registry.
-- Safe to re-run. Adds columns only; existing rows keep working (all NULL).
--
-- A result is one row per scanned answer sheet (omr_results). These fields say
-- WHAT exam it was and WHO took it, so scores can be listed per student/class.
-- The class/room are copied onto the row at scan time (a snapshot) so reports
-- stay correct after a student moves up a year.

ALTER TABLE public.omr_results
  ADD COLUMN IF NOT EXISTS exam_kind text,        -- ระหว่างเรียน | กลางภาค | ปลายภาค | อื่นๆ
  ADD COLUMN IF NOT EXISTS exam_name text,        -- ชื่อการสอบ เช่น "สอบหน่วยที่ 2"
  ADD COLUMN IF NOT EXISTS academic_year int,     -- ปีการศึกษา (พ.ศ.) เช่น 2569
  ADD COLUMN IF NOT EXISTS semester int,          -- ภาคเรียน 1 หรือ 2
  ADD COLUMN IF NOT EXISTS class_level text,      -- ชั้นตอนสอบ เช่น 'ม.1'
  ADD COLUMN IF NOT EXISTS room text,             -- ห้องตอนสอบ
  ADD COLUMN IF NOT EXISTS student_ref uuid REFERENCES public.students(id) ON DELETE SET NULL;

DO $$ BEGIN
  ALTER TABLE public.omr_results ADD CONSTRAINT omr_results_semester_check CHECK (semester IS NULL OR semester IN (1, 2));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS omr_results_student_ref_idx ON public.omr_results (student_ref);
CREATE INDEX IF NOT EXISTS omr_results_exam_idx ON public.omr_results (user_id, academic_year, semester, exam_kind);

-- Report view: one line per scored sheet with the student's details.
-- security_invoker = the caller's own RLS applies, so a teacher only sees
-- results they scanned themselves.
CREATE OR REPLACE VIEW public.omr_scores_report
WITH (security_invoker = true) AS
SELECT
  r.id,
  r.user_id,
  r.taken_at,
  r.subject_name,
  r.exam_kind,
  r.exam_name,
  r.academic_year,
  r.semester,
  COALESCE(s.student_code, NULLIF(r.student_id, '')) AS student_code,
  COALESCE(
    NULLIF(r.student_name, ''),
    NULLIF(trim(concat(coalesce(s.prefix, ''), s.first_name, ' ', coalesce(s.last_name, ''))), '')
  ) AS student_name,
  COALESCE(r.class_level, s.class_level) AS class_level,
  COALESCE(r.room, s.room) AS room,
  r.score,
  r.total,
  CASE WHEN r.total > 0 THEN round(r.score * 100.0 / r.total, 1) END AS percent
FROM public.omr_results r
LEFT JOIN public.students s ON s.id = r.student_ref
WHERE r.deleted_at IS NULL;

GRANT SELECT ON public.omr_scores_report TO authenticated;
