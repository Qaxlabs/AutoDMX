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
