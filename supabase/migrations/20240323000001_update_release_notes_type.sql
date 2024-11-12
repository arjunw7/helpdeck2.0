-- Update release_notes table to use array for type
ALTER TABLE release_notes
ALTER COLUMN type TYPE text[] USING ARRAY[type];

-- Update type check constraint
ALTER TABLE release_notes
DROP CONSTRAINT type_check;

-- Add new check constraint for array values
ALTER TABLE release_notes
ADD CONSTRAINT type_check CHECK (
  type <@ ARRAY['major', 'minor', 'patch']::text[]
);