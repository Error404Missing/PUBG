-- 1. Create Global Chat Table
CREATE TABLE IF NOT EXISTS public.global_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.global_messages ENABLE ROW LEVEL SECURITY;

-- 3. Policies for Global Chat
-- Everyone can read global messages
CREATE POLICY "Anyone can view global messages"
ON public.global_messages FOR SELECT
USING (true);

-- Authenticated and NOT BANNED users can insert messages
CREATE POLICY "Non-banned users can insert global messages"
ON public.global_messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_banned = false
  )
);

-- Admins can delete any message (optional cleanup)
CREATE POLICY "Admins can delete global messages"
ON public.global_messages FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  )
);

-- 4. Enable Realtime for Global Chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_messages;
