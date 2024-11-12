-- Add publishing status to organizations table
ALTER TABLE organizations
ADD COLUMN is_published boolean DEFAULT false,
ADD COLUMN published_at timestamp with time zone;