-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id),
  accessibility VARCHAR(50) DEFAULT 'public',
  org_id UUID REFERENCES organizations(id) NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  updated_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow users to view categories they have access to
CREATE POLICY "View categories" ON categories
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    ) AND (
      accessibility = 'public' OR
      created_by = auth.uid()
    )
  );

-- Allow users to create categories in their organization
CREATE POLICY "Create categories" ON categories
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Allow users to update their own categories
CREATE POLICY "Update categories" ON categories
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();