-- =====================================================
-- FINAL COMPREHENSIVE FIX SCRIPT - VERSION 3
-- Run this in Supabase SQL Editor to solve all issues
-- =====================================================

-- 1. Create or Update rules table with correct RLS
CREATE TABLE IF NOT EXISTS public.rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can view rules" ON public.rules;
    CREATE POLICY "Anyone can view rules" ON public.rules FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Admins can insert rules" ON public.rules;
    CREATE POLICY "Admins can insert rules" ON public.rules FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
    );

    DROP POLICY IF EXISTS "Admins can update rules" ON public.rules;
    CREATE POLICY "Admins can update rules" ON public.rules FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
    );

    DROP POLICY IF EXISTS "Admins can delete rules" ON public.rules;
    CREATE POLICY "Admins can delete rules" ON public.rules FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
    );
END $$;

-- 2. Ensure profiles table has all necessary columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'guest';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_username TEXT;

-- 3. Fix DEFAULT images for profiles (Dark Theme)
UPDATE public.profiles 
SET avatar_url = 'https://i.ibb.co/vzD7Z0M/default-avatar-dark.png' 
WHERE avatar_url IS NULL OR avatar_url = '' OR avatar_url LIKE '%imgur%' OR avatar_url LIKE '%api.dicebear.com%';

UPDATE public.profiles 
SET banner_url = 'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg' 
WHERE banner_url IS NULL OR banner_url = '' OR banner_url LIKE '%unsplash%';

-- 4. Update handle_new_user trigger to use dark defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    discord_username, 
    is_admin,
    avatar_url,
    banner_url,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'discord_username', NULL),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::BOOLEAN, FALSE),
    'https://i.ibb.co/vzD7Z0M/default-avatar-dark.png',
    'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg',
    'guest'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(profiles.username, EXCLUDED.username);
  
  RETURN NEW;
END;
$$;

-- 5. Fix Schedule Deletion Policy (Cascade and foreign keys)
DO $$
DECLARE
    r record;
BEGIN
    -- Drop ALL existing foreign keys referencing schedules(id) from scrim_requests
    FOR r IN (
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = 'scrim_requests' 
        AND tc.table_schema = 'public' 
        AND kcu.column_name = 'schedule_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE public.scrim_requests DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
    
    -- Drop ALL existing foreign keys referencing schedules(id) from results
    FOR r IN (
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = 'results' 
        AND tc.table_schema = 'public' 
        AND kcu.column_name = 'schedule_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE public.results DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Add back constraints with ON DELETE CASCADE
ALTER TABLE public.scrim_requests 
ADD CONSTRAINT scrim_requests_schedule_id_fkey 
FOREIGN KEY (schedule_id) 
REFERENCES public.schedules(id) 
ON DELETE CASCADE;

ALTER TABLE public.results 
ADD CONSTRAINT results_schedule_id_fkey 
FOREIGN KEY (schedule_id) 
REFERENCES public.schedules(id) 
ON DELETE CASCADE;

-- Update Schedules RLS Policies to use EXISTS (standard Practice)
DROP POLICY IF EXISTS "Admins can delete schedules" ON public.schedules;
CREATE POLICY "Admins can delete schedules" ON public.schedules FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
);

-- 6. Add trigger for VIP Case Opening to update Profile Checkbox/Badge
CREATE OR REPLACE FUNCTION public.on_vip_status_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.teams 
  SET is_vip = (NEW.vip_until > NOW())
  WHERE leader_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_vip_status_change ON public.user_vip_status;
CREATE TRIGGER tr_vip_status_change
  AFTER INSERT OR UPDATE ON public.user_vip_status
  FOR EACH ROW
  EXECUTE FUNCTION public.on_vip_status_change();

-- 7. Initial Rules Data Refresh
DELETE FROM public.rules;
INSERT INTO public.rules (title, content, order_number)
VALUES 
('Anti-Cheat Protocol', 'ნებისმიერი ტიპის დამხმარე პროგრამის (Cheats, Scripts, Macros) გამოყენება მკაცრად აკრძალულია. დარღვევის შემთხვევაში მოთამაშე და გუნდი მიიღებს სამუდამო ბანს Arena-ს ყველა ტურნირზე.', 1),
('Professional Conduct', 'გუნდებმა უნდა დაიცვან ეთიკის ნორმები. შეურაცხყოფა, ტოქსიკურობა ან არასპორტული ქცევა გამოიწვევს გუნდის დისკვალიფიკაციას და ქულების ჩამორთმევას.', 2),
('Match Readiness', 'ყველა გუნდი ვალდებულია მატჩის დაწყებამდე 10 წუთით ადრე იყოს ლობიში. დაგვიანების შემთხვევაში გუნდი შესაძლოა ჩაენაცვლოს სხვა გუნდით.', 3),
('Registration Deadline', 'სკრიმებზე რეგისტრაცია წყდება მატჩის დაწყებამდე 2 საათით ადრე. ამ დროის შემდეგ მოთხოვნები აღარ განიხილება.', 4),
('Team Requirements', 'გუნდი უნდა შედგებოდეს მინიმუმ 4 ძირითადი მოთამაშისგან. დაუშვებელია სხვა გუნდის მოთამაშეების გამოყენება (Ringer) ადმინისტრაციასთან შეთანხმების გარეშე.', 5);

-- 8. Storage Buckets and Policies Support
-- This ensures 'profiles' and 'results' buckets exist with correct RLS
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true), ('results', 'results', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
    -- Profiles Policies
    DROP POLICY IF EXISTS "Public Access Profiles" ON storage.objects;
    CREATE POLICY "Public Access Profiles" ON storage.objects FOR SELECT USING (bucket_id = 'profiles');
    
    DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
    CREATE POLICY "Users can upload their own profile images" ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'profiles');

    DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
    CREATE POLICY "Users can update their own profile images" ON storage.objects FOR UPDATE TO authenticated 
    USING (bucket_id = 'profiles');

    -- Results Policies
    DROP POLICY IF EXISTS "Public Access Results" ON storage.objects;
    CREATE POLICY "Public Access Results" ON storage.objects FOR SELECT USING (bucket_id = 'results');

    DROP POLICY IF EXISTS "Admins can upload results" ON storage.objects;
    CREATE POLICY "Admins can upload results" ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'results' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));
END $$;

-- 9. Reload Schema
NOTIFY pgrst, 'reload schema';
