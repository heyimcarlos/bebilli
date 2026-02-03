-- Create storage bucket for group images
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-images', 'group-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload group images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'group-images');

-- Allow public access to view group images
CREATE POLICY "Group images are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'group-images');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own group images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'group-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own group images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'group-images' AND auth.uid()::text = (storage.foldername(name))[1]);