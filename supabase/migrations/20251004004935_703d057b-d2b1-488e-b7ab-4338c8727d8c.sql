-- Add support for multiple images and cover image selection
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cover_image_index INTEGER DEFAULT 0;

-- Update RLS policies to allow admin-only deletion
DROP POLICY IF EXISTS "Anyone can delete activities" ON public.activities;

CREATE POLICY "Only admins can delete activities"
ON public.activities
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND approved = true
  )
);