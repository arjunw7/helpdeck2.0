-- Add domain and SEO settings columns to organizations table
ALTER TABLE organizations
ADD COLUMN custom_domain text,
ADD COLUMN domain_verified boolean DEFAULT false,
ADD COLUMN seo_settings jsonb DEFAULT '{
  "metaTitle": "",
  "metaDescription": "",
  "ogImage": "",
  "favicon": "",
  "googleAnalyticsId": ""
}'::jsonb,
ADD COLUMN domain_settings jsonb DEFAULT '{
  "customDomain": "",
  "isVerified": false,
  "verifiedAt": null
}'::jsonb;

-- Add index for custom domain lookups
CREATE INDEX idx_organizations_custom_domain ON organizations(custom_domain);

-- Add constraint for valid domain format
ALTER TABLE organizations
ADD CONSTRAINT valid_custom_domain
CHECK (
  custom_domain IS NULL OR
  custom_domain ~ '^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$'
);