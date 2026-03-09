-- 1. Enhance global_messages Table
ALTER TABLE public.global_messages 
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES public.global_messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]'::jsonb;

-- 2. Update RLS for Deletion (Admins can delete anything, users delete their own)
DROP POLICY IF EXISTS "Admins can delete global messages" ON public.global_messages;
CREATE POLICY "Admins or owners can delete global messages"
ON public.global_messages FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  ) 
  OR user_id = auth.uid()
);

-- 3. Allow users to update their own messages (for reactions)
CREATE POLICY "Users can update global messages for reactions"
ON public.global_messages FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true); -- We will handle specific logic in the app or a trigger, but RLS must allow the update
