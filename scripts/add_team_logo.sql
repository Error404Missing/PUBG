-- =====================================================
-- ADD TEAM LOGO SUPPORT
-- =====================================================

-- 1. Add logo_url column to teams table (if not exists)
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;

-- 2. Create team-logos storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-logos', 'team-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage Policies for team-logos bucket
DO $$
BEGIN
    -- Drop existing if any
    DROP POLICY IF EXISTS "Public Access Team Logos" ON storage.objects;
    DROP POLICY IF EXISTS "Managers can upload team logos" ON storage.objects;
    DROP POLICY IF EXISTS "Managers can update team logos" ON storage.objects;
    DROP POLICY IF EXISTS "Managers can delete team logos" ON storage.objects;

    -- Everyone can view team logos
    CREATE POLICY "Public Access Team Logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'team-logos');

    -- Authenticated users (managers) can upload
    CREATE POLICY "Managers can upload team logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'team-logos');

    -- Authenticated users can update/replace their uploads
    CREATE POLICY "Managers can update team logos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'team-logos');

    -- Authenticated users can delete their uploads
    CREATE POLICY "Managers can delete team logos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'team-logos');

END $$;
