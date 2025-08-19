-- Fix critical security vulnerability: Restrict admission applications access to authorized users only

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Allow read own admission applications" ON public.admission_applications;
DROP POLICY IF EXISTS "Anyone can view published news" ON public.admission_applications;

-- Create a secure SELECT policy that only allows authenticated users with admin or staff roles
CREATE POLICY "Only admins and staff can view admission applications" 
ON public.admission_applications 
FOR SELECT 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'staff'::app_role)
);

-- Add staff role to the existing enum if it doesn't exist
DO $$ 
BEGIN
  -- Check if 'staff' role exists in the enum, if not add it
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'staff' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'staff';
  END IF;
END $$;