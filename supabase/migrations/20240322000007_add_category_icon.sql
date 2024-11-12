-- Add icon column to categories table
ALTER TABLE categories
ADD COLUMN icon text DEFAULT '📚';

-- Update existing rows to have the default icon
UPDATE categories
SET icon = '📚'
WHERE icon IS NULL;