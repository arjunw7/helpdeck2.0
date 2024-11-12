-- Add voting columns to articles table
ALTER TABLE articles
ADD COLUMN upvotes integer NOT NULL DEFAULT 0,
ADD COLUMN downvotes integer NOT NULL DEFAULT 0;

-- Create index for sorting by votes
CREATE INDEX idx_articles_votes ON articles(upvotes DESC, downvotes ASC);