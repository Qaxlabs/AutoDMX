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

