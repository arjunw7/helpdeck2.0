-- Add type column as text array
ALTER TABLE release_notes
ADD COLUMN type text[] NOT NULL DEFAULT '{}';

-- Add check constraint to ensure valid types
ALTER TABLE release_notes
ADD CONSTRAINT type_check CHECK (
  type <@ ARRAY['major', 'minor', 'patch']::text[]
);

-- Create index for type column
CREATE INDEX release_notes_type_idx ON release_notes USING GIN (type);