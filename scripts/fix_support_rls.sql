-- Ensure support_messages RLS is robust for admins
DROP POLICY IF EXISTS "Admins can view all support messages" ON public.support_messages;
CREATE POLICY "Admins can view all support messages"
ON public.support_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  )
);

DROP POLICY IF EXISTS "Admins can insert support replies" ON public.support_messages;
CREATE POLICY "Admins can insert support replies"
ON public.support_messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  ) AND sender_type = 'admin'
);

-- Also ensure admins can view other users' profiles to see their usernames in chat
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  ) OR id = auth.uid()
);

-- Force enable realtime for support_messages if not already
ALTER TABLE public.support_messages REPLICA IDENTITY FULL;
