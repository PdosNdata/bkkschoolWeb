-- Admin-chosen colours / border / shadow for the home page cards.
-- One row (id = 'main'); `styles` is {"media.video": {c1,c2,c3,angle,border,shadowBlur,shadowOpacity}, ...}.
CREATE TABLE IF NOT EXISTS public.card_styles (
  id text PRIMARY KEY DEFAULT 'main',
  styles jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid DEFAULT auth.uid(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.card_styles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view card styles" ON public.card_styles;
CREATE POLICY "Anyone can view card styles" ON public.card_styles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert card styles" ON public.card_styles;
CREATE POLICY "Admins can insert card styles" ON public.card_styles FOR INSERT WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update card styles" ON public.card_styles;
CREATE POLICY "Admins can update card styles" ON public.card_styles FOR UPDATE USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete card styles" ON public.card_styles;
CREATE POLICY "Admins can delete card styles" ON public.card_styles FOR DELETE USING (public.is_admin());
