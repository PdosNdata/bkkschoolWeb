-- Storage policies to enable avatar uploads and updates by authenticated users
-- Public read access for avatars bucket
CREATE POLICY IF NOT EXISTS "Public read access to avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload files under a folder named with their user id
CREATE POLICY IF NOT EXISTS "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update files in their own folder
CREATE POLICY IF NOT EXISTS "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
