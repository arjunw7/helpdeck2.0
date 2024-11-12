-- Add voting columns to release_notes table
ALTER TABLE release_notes
ADD COLUMN upvotes integer NOT NULL DEFAULT 0,
ADD COLUMN downvotes integer NOT NULL DEFAULT 0;

-- Create index for sorting by votes
CREATE INDEX idx_release_notes_votes ON release_notes(upvotes DESC, downvotes ASC);