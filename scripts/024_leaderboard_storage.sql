-- Create Leaderboard Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('leaderboard', 'leaderboard', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read access
CREATE POLICY "Public Read Leaderboard" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'leaderboard');

-- Admin write access
CREATE POLICY "Admins Manage Leaderboard Storage" 
ON storage.objects FOR ALL 
TO authenticated
USING (
    bucket_id = 'leaderboard' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
    )
)
WITH CHECK (
    bucket_id = 'leaderboard' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
    )
);
