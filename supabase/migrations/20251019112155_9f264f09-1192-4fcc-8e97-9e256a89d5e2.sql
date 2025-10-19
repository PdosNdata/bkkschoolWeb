-- Add 'teacher' role to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'teacher';

-- Create function to check if user can access dashboard (admin or teacher)
CREATE OR REPLACE FUNCTION public.can_access_dashboard()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'teacher')
      AND approved = true
  );
$$;