-- Create custom enums
CREATE TYPE trigger_type_enum AS ENUM ('comment', 'dm', 'story_reply', 'story_mention');
CREATE TYPE media_scope_enum AS ENUM ('specific', 'any', 'next');
CREATE TYPE direction_enum AS ENUM ('in', 'out');

-- Create accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    ig_user_id TEXT NOT NULL,
    ig_username TEXT NOT NULL,
    encrypted_access_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ,
    fb_page_id TEXT,
    app_id TEXT,
    encrypted_app_secret TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create automations table
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    trigger_type trigger_type_enum NOT NULL,
    media_scope media_scope_enum NOT NULL,
    media_id TEXT,
    keywords TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    public_reply_variants TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    opening_dm TEXT,
    requires_follow BOOLEAN DEFAULT false NOT NULL,
    follow_prompt_message TEXT,
    follow_up_message TEXT,
    follow_up_delay_minutes INTEGER,
    final_message TEXT,
    final_links TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    email_capture BOOLEAN DEFAULT false NOT NULL,
    ai_enabled BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    igsid TEXT NOT NULL,
    username TEXT NOT NULL,
    profile_pic_url TEXT,
    follows_business BOOLEAN, -- NULL means "not checked yet"
    email TEXT,
    phone TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create conversation_state table
CREATE TABLE conversation_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
    current_step TEXT NOT NULL,
    window_expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create message_log table
CREATE TABLE message_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    direction direction_enum NOT NULL,
    content TEXT NOT NULL,
    status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create send_queue table
CREATE TABLE send_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    payload JSONB NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent BOOLEAN DEFAULT false NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE send_queue ENABLE ROW LEVEL SECURITY;

-- Enable RLS Policies
-- accounts: only readable/writable by owning user
CREATE POLICY accounts_policy ON accounts
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- automations: only readable/writable if account belongs to user
CREATE POLICY automations_policy ON automations
    FOR ALL
    TO authenticated
    USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()))
    WITH CHECK (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

-- contacts: only readable/writable if account belongs to user
CREATE POLICY contacts_policy ON contacts
    FOR ALL
    TO authenticated
    USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()))
    WITH CHECK (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

-- conversation_state: only readable/writable if contact belongs to user
CREATE POLICY conversation_state_policy ON conversation_state
    FOR ALL
    TO authenticated
    USING (contact_id IN (SELECT id FROM contacts WHERE account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())))
    WITH CHECK (contact_id IN (SELECT id FROM contacts WHERE account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())));

-- message_log: only readable/writable if contact belongs to user
CREATE POLICY message_log_policy ON message_log
    FOR ALL
    TO authenticated
    USING (contact_id IN (SELECT id FROM contacts WHERE account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())))
    WITH CHECK (contact_id IN (SELECT id FROM contacts WHERE account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())));

-- send_queue: only readable/writable if account belongs to user
CREATE POLICY send_queue_policy ON send_queue
    FOR ALL
    TO authenticated
    USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()))
    WITH CHECK (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));

-- Create tracked_links table
CREATE TABLE IF NOT EXISTS tracked_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for tracked_links
ALTER TABLE tracked_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for redirect" ON tracked_links
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role insert" ON tracked_links
  FOR INSERT
  WITH CHECK (true);

-- Create link_clicks table
CREATE TABLE IF NOT EXISTS link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for link_clicks
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read clicks for their automations" ON link_clicks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM automations
      JOIN accounts ON automations.account_id = accounts.id
      WHERE automations.id = link_clicks.automation_id
        AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow public insert for clicks" ON link_clicks
  FOR INSERT
  WITH CHECK (true);

-- Disable Row Level Security on all tables since route authorization is managed in middleware
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE automations DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE send_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks DISABLE ROW LEVEL SECURITY;

-- Drop foreign key constraint on accounts.user_id referencing auth.users(id)
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_user_id_fkey;

-- Make user_id nullable in accounts
ALTER TABLE accounts ALTER COLUMN user_id DROP NOT NULL;

-- Add webhook_account_id to accounts table to record webhook Meta ID namespace references
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS webhook_account_id TEXT;

-- Simplify the automation model: add message (TEXT) and links (TEXT[])
ALTER TABLE automations ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS links TEXT[] DEFAULT '{}'::TEXT[] NOT NULL;

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
