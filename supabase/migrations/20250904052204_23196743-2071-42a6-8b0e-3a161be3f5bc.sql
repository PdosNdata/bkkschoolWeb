-- Fix critical security vulnerabilities

-- 1. Add user_id column to media_resources for ownership tracking
ALTER TABLE public.media_resources ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. Create security definer function to set media owner
CREATE OR REPLACE FUNCTION public.set_media_owner()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to auto-set owner on media insert
CREATE TRIGGER set_media_owner_trigger
  BEFORE INSERT ON public.media_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.set_media_owner();

-- 4. Fix admission_applications RLS - restrict to admins only
DROP POLICY IF EXISTS "Allow read own admission applications" ON public.admission_applications;
CREATE POLICY "Only admins can view admission applications" 
ON public.admission_applications 
FOR SELECT 
USING (public.has_role('teacher'));

-- 5. Fix activities RLS - only teachers can modify
DROP POLICY IF EXISTS "Anyone can create activities" ON public.activities;
DROP POLICY IF EXISTS "Anyone can update activities" ON public.activities;
DROP POLICY IF EXISTS "Anyone can delete activities" ON public.activities;

CREATE POLICY "Only teachers can create activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (public.has_role('teacher'));

CREATE POLICY "Only teachers can update activities" 
ON public.activities 
FOR UPDATE 
USING (public.has_role('teacher'));

CREATE POLICY "Only teachers can delete activities" 
ON public.activities 
FOR DELETE 
USING (public.has_role('teacher'));

-- 6. Fix news RLS - only teachers can modify
DROP POLICY IF EXISTS "Anyone can create news" ON public.news;
DROP POLICY IF EXISTS "Anyone can update news" ON public.news;
DROP POLICY IF EXISTS "Anyone can delete news" ON public.news;

CREATE POLICY "Only teachers can create news" 
ON public.news 
FOR INSERT 
WITH CHECK (public.has_role('teacher'));

CREATE POLICY "Only teachers can update news" 
ON public.news 
FOR UPDATE 
USING (public.has_role('teacher'));

CREATE POLICY "Only teachers can delete news" 
ON public.news 
FOR DELETE 
USING (public.has_role('teacher'));

-- 7. Fix user_roles RLS - prevent role escalation
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;

CREATE POLICY "Only admins can assign roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role('teacher'));

CREATE POLICY "Only admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role('teacher'));

-- 8. Fix media_resources RLS - ownership based
DROP POLICY IF EXISTS "Authenticated users can update media resources" ON public.media_resources;
DROP POLICY IF EXISTS "Authenticated users can delete media resources" ON public.media_resources;
DROP POLICY IF EXISTS "Authenticated users can create media resources" ON public.media_resources;

CREATE POLICY "Only teachers can create media resources" 
ON public.media_resources 
FOR INSERT 
WITH CHECK (public.has_role('teacher'));

CREATE POLICY "Users can update their own media or admins can update any" 
ON public.media_resources 
FOR UPDATE 
USING (auth.uid() = user_id OR public.has_role('teacher'));

CREATE POLICY "Users can delete their own media or admins can delete any" 
ON public.media_resources 
FOR DELETE 
USING (auth.uid() = user_id OR public.has_role('teacher'));

-- 9. Add storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 10. Add storage policies for news-images bucket
CREATE POLICY "Teachers can upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-images' AND public.has_role('teacher'));

CREATE POLICY "Teachers can update news images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'news-images' AND public.has_role('teacher'));

CREATE POLICY "Teachers can delete news images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'news-images' AND public.has_role('teacher'));