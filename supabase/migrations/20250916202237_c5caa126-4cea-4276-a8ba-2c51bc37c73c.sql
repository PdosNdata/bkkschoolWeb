-- Fix critical security vulnerability: Restrict admission applications access to admins only
-- Remove the overly permissive read policy that allows anyone to see all applications
DROP POLICY IF EXISTS "Allow read own admission applications" ON public.admission_applications;

-- Create new secure policy that only allows admins to read admission applications
CREATE POLICY "Only admins can read admission applications" 
ON public.admission_applications 
FOR SELECT 
USING (is_admin());

-- Keep the public insert policy so people can still submit applications
-- (This policy already exists and is secure: "Allow public insert on admission applications")