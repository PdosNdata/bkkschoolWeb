-- Subject code (รหัสวิชา, e.g. ว22104) for the OMR answer-sheet checker.
-- Adds columns only; safe to re-run. Existing rows keep working (NULL).
--
-- RUN THIS BEFORE deploying the /omr/ page that sends these fields, otherwise syncing
-- subjects/results fails with "column ... does not exist".

ALTER TABLE public.omr_subjects ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE public.omr_results  ADD COLUMN IF NOT EXISTS subject_code text;

-- Report view: same columns as before, plus subject_code appended at the end
-- (CREATE OR REPLACE VIEW may only add columns at the end).
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
  CASE WHEN r.total > 0 THEN round(r.score * 100.0 / r.total, 1) END AS percent,
  r.subject_code
FROM public.omr_results r
LEFT JOIN public.students s ON s.id = r.student_ref
WHERE r.deleted_at IS NULL;

GRANT SELECT ON public.omr_scores_report TO authenticated;
