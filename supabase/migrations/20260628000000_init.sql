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
