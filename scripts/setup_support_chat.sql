CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender_type TEXT CHECK (sender_type IN ('user', 'admin')) NOT NULL,
    sender_id UUID REFERENCES auth.users(id),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Add explicit profile FK for easier joining
    CONSTRAINT fk_user_profile FOREIGN KEY (user_id) REFERENCES public.profiles(id),
    CONSTRAINT fk_sender_profile FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON public.support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_sender_id ON public.support_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Users can view their own messages
CREATE POLICY "Users can view their own support messages"
ON public.support_messages FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Users can insert their own messages
CREATE POLICY "Users can insert their own support messages"
ON public.support_messages FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND sender_type = 'user');

-- 3. Admins can see all messages
CREATE POLICY "Admins can view all support messages"
ON public.support_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  )
);

-- 4. Admins can insert replies
CREATE POLICY "Admins can insert support replies"
ON public.support_messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  ) AND sender_type = 'admin'
);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
