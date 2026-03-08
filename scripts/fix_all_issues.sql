-- 1. Create rules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rules
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- Rules policies (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rules' AND policyname = 'Anyone can view rules') THEN
        CREATE POLICY "Anyone can view rules" ON public.rules FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rules' AND policyname = 'Admins can insert rules') THEN
        CREATE POLICY "Admins can insert rules" ON public.rules FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rules' AND policyname = 'Admins can update rules') THEN
        CREATE POLICY "Admins can update rules" ON public.rules FOR UPDATE USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rules' AND policyname = 'Admins can delete rules') THEN
        CREATE POLICY "Admins can delete rules" ON public.rules FOR DELETE USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
        );
    END IF;
END $$;

-- 2. Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Set default dark avatar and banner for users who don't have one
-- Default Dark Avatar (Grey circle with person icon feel)
UPDATE public.profiles 
SET avatar_url = 'https://i.ibb.co/vzD7Z0M/default-avatar-dark.png' 
WHERE avatar_url IS NULL OR avatar_url = '';

-- Default Dark Banner (Dark grey abstract)
UPDATE public.profiles 
SET banner_url = 'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg' 
WHERE banner_url IS NULL OR banner_url = '';

-- 3. Update handle_new_user function to include defaults
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
    banner_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'discord_username', NULL),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::BOOLEAN, FALSE),
    'https://i.ibb.co/vzD7Z0M/default-avatar-dark.png',
    'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 4. Initial Rules Data
DELETE FROM public.rules; -- Clear existing to avoid duplicates if partially run
INSERT INTO public.rules (title, content, order_number)
VALUES 
('Anti-Cheat Protocol', 'ნებისმიერი ტიპის დამხმარე პროგრამის (Cheats, Scripts, Macros) გამოყენება მკაცრად აკრძალულია. დარღვევის შემთხვევაში მოთამაშე და გუნდი მიიღებს სამუდამო ბანს Arena-ს ყველა ტურნირზე.', 1),
('Professional Conduct', 'გუნდებმა უნდა დაიცვან ეთიკის ნორმები. შეურაცხყოფა, ტოქსიკურობა ან არასპორტული ქცევა გამოიწვევს გუნდის დისკვალიფიკაციას და ქულების ჩამორთმევას.', 2),
('Match Readiness', 'ყველა გუნდი ვალდებულია მატჩის დაწყებამდე 10 წუთით ადრე იყოს ლობიში. დაგვიანების შემთხვევაში გუნდი შესაძლოა ჩაენაცვლოს სხვა გუნდით.', 3),
('Registration Deadline', 'სკრიმებზე რეგისტრაცია წყდება მატჩის დაწყებამდე 2 საათით ადრე. ამ დროის შემდეგ მოთხოვნები აღარ განიხილება.', 4),
('Team Requirements', 'გუნდი უნდა შედგებოდეს მინიმუმ 4 ძირითადი მოთამაშისგან. დაუშვებელია სხვა გუნდის მოთამაშეების გამოყენება (Ringer) ადმინისტრაციასთან შეთანხმების გარეშე.', 5);

NOTIFY pgrst, 'reload schema';
