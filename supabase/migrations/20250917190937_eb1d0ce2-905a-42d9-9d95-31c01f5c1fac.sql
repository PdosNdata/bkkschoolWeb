-- Create news-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-images', 'news-images', true);

-- Create RLS policies for news-images bucket
CREATE POLICY "Allow public read access to news images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

CREATE POLICY "Allow authenticated users to upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their news images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their news images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');