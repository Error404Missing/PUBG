-- ==========================================
-- EMERGENCY FIX FOR GLOBAL CHAT PERMISSIONS
-- ==========================================

-- 1. Ensure columns exist (just in case they were missed)
ALTER TABLE public.global_messages 
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES public.global_messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]'::jsonb;

-- 2. Make sure user_id references auth.users to be more permissive 
-- (while still keeping the link to profiles for joins)
ALTER TABLE public.global_messages DROP CONSTRAINT IF EXISTS global_messages_user_id_fkey;
ALTER TABLE public.global_messages DROP CONSTRAINT IF EXISTS global_messages_user_id_fkey_profiles;

ALTER TABLE public.global_messages 
ADD CONSTRAINT global_messages_user_id_fkey_profiles 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Reset RLS Policies to be robust
DROP POLICY IF EXISTS "Anyone can view global messages" ON public.global_messages;
DROP POLICY IF EXISTS "Non-banned users can insert global messages" ON public.global_messages;
DROP POLICY IF EXISTS "Non-banned users insert chat" ON public.global_messages;
DROP POLICY IF EXISTS "Admins or owners can delete global messages" ON public.global_messages;
DROP POLICY IF EXISTS "Admins delete messages" ON public.global_messages;
DROP POLICY IF EXISTS "Anyone can update global messages for reactions" ON public.global_messages;
DROP POLICY IF EXISTS "Users can update global messages for reactions" ON public.global_messages;

-- Reading: Everyone
CREATE POLICY "Anyone can view global messages" ON public.global_messages FOR SELECT USING (true);

-- Inserting: Authenticated users who are NOT explicitly banned
-- We use COALESCE to treat NULL is_banned as false
CREATE POLICY "Non-banned users can insert global messages" 
ON public.global_messages 
FOR INSERT TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND COALESCE(is_banned, false) = false
    )
);

-- Deleting: Admin or Owner
CREATE POLICY "Admins or owners can delete global messages" 
ON public.global_messages 
FOR DELETE TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (is_admin = true OR role = 'admin')
    )
    OR user_id = auth.uid()
);

-- Updating: Everyone (for reactions)
CREATE POLICY "Anyone can update global messages" 
ON public.global_messages 
FOR UPDATE TO authenticated 
USING (true)
WITH CHECK (true);

-- 4. Final verification of the view
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
    (COALESCE(p.is_admin, false) = true OR p.role = 'admin') as "isAdmin",
    EXISTS (
        SELECT 1 FROM public.user_vip_status v 
        WHERE v.user_id = gm.user_id AND v.vip_until > now()
    ) as "isVip"
FROM public.global_messages gm
LEFT JOIN public.profiles p ON gm.user_id = p.id;

GRANT SELECT ON public.global_chat_v2 TO anon, authenticated;
