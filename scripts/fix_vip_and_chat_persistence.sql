-- ==========================================
-- FINAL FIX FOR VIP SCHEMA & GLOBAL CHAT
-- ==========================================

-- 1. FIX user_vip_status SCHEMA
ALTER TABLE public.user_vip_status ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. ENSURE profiles AND global_messages ARE CORRECTLY LINKED
-- This helps Supabase (PostgREST) perform joins automatically
DO $$ 
BEGIN
    -- Ensure user_id in global_messages references profiles(id)
    ALTER TABLE public.global_messages DROP CONSTRAINT IF EXISTS global_messages_user_id_fkey;
    ALTER TABLE public.global_messages DROP CONSTRAINT IF EXISTS global_messages_user_id_fkey_profiles;
    
    ALTER TABLE public.global_messages 
    ADD CONSTRAINT global_messages_user_id_fkey_profiles 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

-- 3. IMPROVE POLICIES FOR RELIABILITY
-- Ensure everyone can see messages
DROP POLICY IF EXISTS "Anyone can view global messages" ON public.global_messages;
CREATE POLICY "Anyone can view global messages" ON public.global_messages FOR SELECT USING (true);

-- Ensure non-banned users can send
DROP POLICY IF EXISTS "Non-banned users can insert global messages" ON public.global_messages;
CREATE POLICY "Non-banned users can insert global messages" ON public.global_messages 
FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = false)
);

-- 4. ADD HELPER VIEW FOR CHAT WITH VIP STATUS
-- This avoids complex joins in the client side and ensures data is always current
DROP VIEW IF EXISTS public.global_chat_v2;
CREATE OR REPLACE VIEW public.global_chat_v2 AS
SELECT 
    gm.id,
    gm.message as text,
    gm.user_id as "userId",
    gm.created_at,
    gm.reply_to as "replyTo",
    gm.reactions,
    p.username,
    p.avatar_url as avatar,
    (p.is_admin = true OR p.role = 'admin') as "isAdmin",
    EXISTS (
        SELECT 1 FROM public.user_vip_status v 
        WHERE v.user_id = gm.user_id AND v.vip_until > now()
    ) as "isVip"
FROM public.global_messages gm
LEFT JOIN public.profiles p ON gm.user_id = p.id;

-- Grant access to the view
GRANT SELECT ON public.global_chat_v2 TO anon, authenticated;

-- 5. RE-ENABLE REALTIME FOR GLOBAL MESSAGES
-- Just to be absolutely sure
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'global_messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.global_messages;
    END IF;
  END IF;
END $$;
