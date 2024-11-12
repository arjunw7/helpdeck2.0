-- Add slug column to organizations table
ALTER TABLE organizations
ADD COLUMN slug text UNIQUE;

-- Create index for slug lookups
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Add constraint for valid slug format
ALTER TABLE organizations
ADD CONSTRAINT valid_slug_format
CHECK (
  slug IS NULL OR
  slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'
);