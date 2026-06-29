-- Create processed_comments table for deduplication
CREATE TABLE processed_comments (
    comment_id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on the table
ALTER TABLE processed_comments ENABLE ROW LEVEL SECURITY;

-- Enable RLS Policies
-- allow insertion and reads for authenticated and service roles
-- Webhooks run on service role, so they will bypass RLS anyway
CREATE POLICY processed_comments_policy ON processed_comments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
