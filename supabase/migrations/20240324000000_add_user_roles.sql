-- Add role and status to profiles table
ALTER TABLE profiles
ADD COLUMN role text NOT NULL DEFAULT 'member'
CHECK (role IN ('owner', 'admin', 'member')),
ADD COLUMN active boolean NOT NULL DEFAULT true,
ADD COLUMN email text;

-- Create index for role, active status, and email
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(active);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Create function to sync email from auth.users
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET email = (SELECT email FROM auth.users WHERE id = NEW.id)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync email on profile creation
DROP TRIGGER IF EXISTS sync_profile_email_trigger ON profiles;
CREATE TRIGGER sync_profile_email_trigger
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_profile_email();

-- Update existing profiles to have proper roles and emails
WITH ranked_profiles AS (
  SELECT 
    id,
    org_id,
    ROW_NUMBER() OVER (PARTITION BY org_id ORDER BY created_at) as rn
  FROM profiles
)
UPDATE profiles
SET 
  role = CASE 
    WHEN EXISTS (
      SELECT 1 FROM ranked_profiles 
      WHERE ranked_profiles.id = profiles.id 
      AND ranked_profiles.rn = 1
    ) THEN 'owner'
    ELSE 'member'
  END,
  email = (SELECT email FROM auth.users WHERE id = profiles.id);