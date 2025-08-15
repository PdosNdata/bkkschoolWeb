-- Fix news security vulnerability: Restrict news creation to authenticated administrators only

-- Drop the current permissive policy that allows anyone to create news
DROP POLICY IF EXISTS "Anyone can create news" ON public.news;

-- Create a new policy that only allows authenticated users with admin role to create news
CREATE POLICY "Only admins can create news" 
ON public.news 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Add UPDATE and DELETE policies for admins to manage news
CREATE POLICY "Admins can update news" 
ON public.news 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete news" 
ON public.news 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));