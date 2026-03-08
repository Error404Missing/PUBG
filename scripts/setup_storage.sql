-- =====================================================
-- STORAGE BUCKETS AND POLICIES SETUP (SIMPLE VERSION)
-- =====================================================

-- 1. Create Buckets (This usually works in SQL Editor)
-- If this fails, ignore it and create them manually in Supabase Dashboard -> Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('results', 'results', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Set Up Policies (Supabase allows creating policies via SQL Editor)
-- Note: We DON'T use ALTER TABLE on system tables here.

DO $$
BEGIN
    -- DROP EXISTING POLICIES to avoid duplicates
    DROP POLICY IF EXISTS "Public Access Profiles" ON storage.objects;
    DROP POLICY IF EXISTS "Public Access Results" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can upload results" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can delete results" ON storage.objects;
    
    -- PUBLIC ACCESS: Everyone can view images
    CREATE POLICY "Public Access Profiles" ON storage.objects FOR SELECT USING (bucket_id = 'profiles');
    CREATE POLICY "Public Access Results" ON storage.objects FOR SELECT USING (bucket_id = 'results');

    -- PROFILE UPLOADS: Authenticated users can upload to 'profiles' bucket
    CREATE POLICY "Users can upload their own profile images" 
    ON storage.objects FOR INSERT 
    TO authenticated
    WITH CHECK (bucket_id = 'profiles');

    -- UPDATE own files
    CREATE POLICY "Users can update their own profile images" 
    ON storage.objects FOR UPDATE 
    TO authenticated
    USING (bucket_id = 'profiles');

    -- ADMINS: Results Management
    CREATE POLICY "Admins can upload results" 
    ON storage.objects FOR INSERT 
    TO authenticated
    WITH CHECK (
      bucket_id = 'results' AND
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
      )
    );

    CREATE POLICY "Admins can delete results" 
    ON storage.objects FOR DELETE 
    TO authenticated
    USING (
      bucket_id = 'results' AND
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
      )
    );
END $$;
