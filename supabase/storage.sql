-- Create the helpdeck bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('helpdeck', 'helpdeck', true)
ON CONFLICT DO NOTHING;

-- Storage policies for helpdeck bucket
CREATE POLICY "Enable read access for all users"
ON storage.objects FOR SELECT
USING (bucket_id = 'helpdeck');

CREATE POLICY "Enable insert access for authenticated users"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'helpdeck' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Enable update access for authenticated users"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'helpdeck' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Enable delete access for authenticated users"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'helpdeck' AND
  auth.role() = 'authenticated'
);