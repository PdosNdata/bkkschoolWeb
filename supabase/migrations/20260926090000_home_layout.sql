-- Admin-controlled order/visibility of the home page sections.
-- One row (id = 'main'); `sections` is [{"key": "...", "visible": true}, ...].
CREATE TABLE IF NOT EXISTS public.home_layout (
  id text PRIMARY KEY DEFAULT 'main',
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_by uuid DEFAULT auth.uid(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.home_layout ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view home layout" ON public.home_layout;
CREATE POLICY "Anyone can view home layout"
  ON public.home_layout FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert home layout" ON public.home_layout;
CREATE POLICY "Admins can insert home layout"
  ON public.home_layout FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update home layout" ON public.home_layout;
CREATE POLICY "Admins can update home layout"
  ON public.home_layout FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete home layout" ON public.home_layout;
CREATE POLICY "Admins can delete home layout"
  ON public.home_layout FOR DELETE USING (public.is_admin());
