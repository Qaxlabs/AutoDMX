-- Add webhook_account_id to accounts table to record webhook Meta ID namespace references
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS webhook_account_id TEXT;
