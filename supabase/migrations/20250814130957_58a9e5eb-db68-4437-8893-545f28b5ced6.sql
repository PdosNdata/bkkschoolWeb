-- Fix security vulnerability: Restrict admission applications access to admin users only
DROP POLICY IF EXISTS "Allow read own admission applications" ON public.admission_applications;

-- Create new secure policy that only allows admin users to view admission applications
CREATE POLICY "Only admins can view admission applications" 
ON public.admission_applications 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Also restrict the insert policy to authenticated users only for better security
DROP POLICY IF EXISTS "Allow public insert on admission applications" ON public.admission_applications;

CREATE POLICY "Authenticated users can submit admission applications" 
ON public.admission_applications 
FOR INSERT 
TO authenticated
WITH CHECK (true);