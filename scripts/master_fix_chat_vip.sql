-- ==========================================
-- MASTER FIX FOR GLOBAL CHAT & VIP STATUS (FIXED SYNTAX)
-- ==========================================

-- 1. FIX USER VIP STATUS PERMISSIONS
-- Admins need to be able to manage VIP status for any user.

DO $$ 
BEGIN
    -- Remove old restrictive policies
    DROP POLICY IF EXISTS "Admins can manage all VIP statuses" ON public.user_vip_status;
    
    -- Create Admin Policy
    CREATE POLICY "Admins can manage all VIP statuses"
    ON public.user_vip_status
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
      )
    );
END $$;


-- 2. ENSURE GLOBAL CHAT TABLE & COLUMNS EXIST
CREATE TABLE IF NOT EXISTS public.global_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    reply_to UUID REFERENCES public.global_messages(id) ON DELETE SET NULL,
    reactions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE public.global_messages ENABLE ROW LEVEL SECURITY;

-- 3. GLOBAL CHAT POLICIES (Comprehensive Reset)
DO $$ 
BEGIN
    -- Cleanup
    DROP POLICY IF EXISTS "Anyone can view global messages" ON public.global_messages;
    DROP POLICY IF EXISTS "Non-banned users can insert global messages" ON public.global_messages;
    DROP POLICY IF EXISTS "Admins or owners can delete global messages" ON public.global_messages;
    DROP POLICY IF EXISTS "Anyone can update global messages for reactions" ON public.global_messages;
    DROP POLICY IF EXISTS "Users can update global messages for reactions" ON public.global_messages;

    -- Reading
    CREATE POLICY "Anyone can view global messages" ON public.global_messages FOR SELECT USING (true);

    -- Inserting (Only non-banned)
    CREATE POLICY "Non-banned users can insert global messages" ON public.global_messages 
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = false)
    );

    -- Deleting (Admin or Owner)
    CREATE POLICY "Admins or owners can delete global messages" ON public.global_messages 
    FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
        OR user_id = auth.uid()
    );

    -- Updating (Allows Reactions)
    CREATE POLICY "Anyone can update global messages for reactions" ON public.global_messages 
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
END $$;

-- 4. ENABLE REALTIME (Syntax Fix for Publication)
-- This ensures everyone sees messages instantly
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
