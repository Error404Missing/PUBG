-- Create Leaderboards Tables
CREATE TABLE IF NOT EXISTS leaderboard_clans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    points INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    rank INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leaderboard_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT,
    points INTEGER DEFAULT 0,
    kills INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    rank INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE leaderboard_clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_players ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read on clan leaderboard" ON leaderboard_clans
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on player leaderboard" ON leaderboard_players
    FOR SELECT USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin to manage clan leaderboard" ON leaderboard_clans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
        )
    );

CREATE POLICY "Allow admin to manage player leaderboard" ON leaderboard_players
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
        )
    );
