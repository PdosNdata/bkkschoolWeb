-- เลขที่ (roll number within the class room) for each student.
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class_no integer CHECK (class_no IS NULL OR class_no > 0);
CREATE INDEX IF NOT EXISTS students_class_no_idx ON public.students (class_level, room, class_no);
