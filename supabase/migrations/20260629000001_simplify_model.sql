-- Simplify the automation model: add message (TEXT) and links (TEXT[])
ALTER TABLE automations ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS links TEXT[] DEFAULT '{}'::TEXT[] NOT NULL;
