-- Fix storage policy for group-images bucket to restrict uploads to user's own folder
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can upload group images" ON storage.objects;

-- Create a more restrictive INSERT policy that ensures users can only upload to their own folder
CREATE POLICY "Users can upload images to own folder in group-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'group-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Also fix community-images bucket with same pattern
DROP POLICY IF EXISTS "Authenticated users can upload community images" ON storage.objects;

CREATE POLICY "Users can upload images to own folder in community-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);