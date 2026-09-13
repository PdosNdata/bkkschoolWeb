-- Admin-manageable slides for the home page image slider (ImageSlider.tsx).
-- Only admins can add/edit/remove slides; anyone can view them (public site).

CREATE TABLE public.home_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL,
  title text NOT NULL,
  description text,
  link text,
  display_order integer NOT NULL DEFAULT 0,
  user_id uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.home_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view home slides"
  ON public.home_slides FOR SELECT
  USING (true);

CREATE POLICY "Admins can create home slides"
  ON public.home_slides FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update home slides"
  ON public.home_slides FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete home slides"
  ON public.home_slides FOR DELETE
  USING (public.is_admin());

CREATE TRIGGER update_home_slides_updated_at
  BEFORE UPDATE ON public.home_slides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
