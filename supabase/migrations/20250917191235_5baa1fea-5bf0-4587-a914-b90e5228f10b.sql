-- Create media-files storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media-files', 'media-files', true);

-- Create RLS policies for media-files bucket
CREATE POLICY "Allow public read access to media files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media-files');

CREATE POLICY "Allow authenticated users to upload media files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media-files' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their media files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media-files' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their media files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media-files' AND auth.role() = 'authenticated');