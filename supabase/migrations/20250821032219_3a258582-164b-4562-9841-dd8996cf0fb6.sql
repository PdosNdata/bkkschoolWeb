-- Add cover_image column to news table
ALTER TABLE public.news ADD COLUMN cover_image text;

-- Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true);

-- Create storage policies for news images
CREATE POLICY "Anyone can view news images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

CREATE POLICY "Authenticated users can upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update news images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete news images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');