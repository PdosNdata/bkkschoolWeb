-- Fix critical security vulnerability: Restrict admission applications access to authorized users only

-- Drop the existing overly permissive SELECT policy that allows public access
DROP POLICY IF EXISTS "Allow read own admission applications" ON public.admission_applications;

-- Add admin and staff roles to the existing enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'staff';

-- Create a secure SELECT policy that only allows authenticated users with appropriate roles
CREATE POLICY "Only authorized users can view admission applications" 
ON public.admission_applications 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'staff'::app_role) OR
  public.has_role(auth.uid(), 'teacher'::app_role)
);