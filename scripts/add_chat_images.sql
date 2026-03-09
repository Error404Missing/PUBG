-- 1. Add image_url to support_messages
ALTER TABLE public.support_messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create 'support' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('support', 'support', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Set Up Policies for 'support' bucket
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access Support" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload support images" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can manage support images" ON storage.objects;

    CREATE POLICY "Public Access Support" ON storage.objects FOR SELECT USING (bucket_id = 'support');

    -- Any authenticated user can upload
    CREATE POLICY "Users can upload support images" 
    ON storage.objects FOR INSERT 
    TO authenticated
    WITH CHECK (bucket_id = 'support');

    -- Admins can do anything in this bucket
    CREATE POLICY "Admins can manage support images" 
    ON storage.objects FOR ALL
    TO authenticated
    USING (
      bucket_id = 'support' AND
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
      )
    );
END $$;
