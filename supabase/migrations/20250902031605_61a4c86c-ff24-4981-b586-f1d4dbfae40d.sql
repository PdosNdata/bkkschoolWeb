-- Add missing RLS policies for activities table to allow UPDATE and DELETE operations

-- Allow users to update activities
CREATE POLICY "Anyone can update activities" 
ON public.activities 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow users to delete activities  
CREATE POLICY "Anyone can delete activities"
ON public.activities 
FOR DELETE 
USING (true);