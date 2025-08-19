-- Fix critical security vulnerability: Restrict admission applications access to authorized users only

-- Drop the existing overly permissive SELECT policy that allows public access
DROP POLICY IF EXISTS "Allow read own admission applications" ON public.admission_applications;

-- Create a secure SELECT policy that only allows authenticated users with teacher role for now
-- (admin and staff roles will be added in the next migration due to enum transaction limitations)
CREATE POLICY "Only authorized users can view admission applications" 
ON public.admission_applications 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher'::app_role)
);