-- Add updated_at column to organizations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 
                   FROM information_schema.columns 
                   WHERE table_name = 'organizations' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE organizations
        ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();