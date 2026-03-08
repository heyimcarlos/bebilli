INSERT INTO storage.buckets (id, name, public) VALUES ('receipt-images', 'receipt-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload receipts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'receipt-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view receipts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'receipt-images');