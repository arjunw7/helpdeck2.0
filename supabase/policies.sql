-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- Organizations table policies
CREATE POLICY "Allow users to create their organization"
ON organizations FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to view their organization"
ON organizations FOR SELECT TO authenticated
USING (
  id IN (
    SELECT org_id 
    FROM profiles 
    WHERE id = auth.uid()::uuid
  )
);

CREATE POLICY "Allow users to update their organization"
ON organizations FOR UPDATE TO authenticated
USING (
  id IN (
    SELECT org_id 
    FROM profiles 
    WHERE id = auth.uid()::uuid
  )
);

-- Profiles table policies
CREATE POLICY "Allow users to create their profile"
ON profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid()::uuid);

CREATE POLICY "Allow users to view their profile"
ON profiles FOR SELECT TO authenticated
USING (id = auth.uid()::uuid);

CREATE POLICY "Allow users to update their profile"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid()::uuid);