-- Optional photos (up to 10) attached to a training record.
ALTER TABLE public.teacher_trainings
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';
