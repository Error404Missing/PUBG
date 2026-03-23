-- 1. Create News Table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  category TEXT DEFAULT 'სიახლე', -- სიახლე, განახლება, ტურნირი
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add is_owner and owner_title to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS owner_title TEXT DEFAULT 'საიტის მფლობელი და დამფუძნებელი';

-- 3. Set the specifically requested user as Owner
UPDATE public.profiles 
SET is_owner = true, 
    is_admin = true, 
    role = 'admin',
    owner_title = 'საიტის მფლობელი და დამფუძნებელი'
WHERE id = '3a9b48dd-5958-480d-8cd0-3bc7e564493f';

-- 4. Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- 5. Policies for News
DROP POLICY IF EXISTS "Anyone can read news" ON public.news;
CREATE POLICY "Anyone can read news" ON public.news 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
CREATE POLICY "Admins can insert news" ON public.news 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Admins can update news" ON public.news;
CREATE POLICY "Admins can update news" ON public.news 
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
CREATE POLICY "Admins can delete news" ON public.news 
  FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 6. Trigger for news created_at reload
NOTIFY pgrst, 'reload schema';
