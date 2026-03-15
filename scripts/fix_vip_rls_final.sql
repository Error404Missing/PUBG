-- ==========================================
-- FINAL FIX FOR VIP STATUS RLS POLICIES
-- ==========================================

-- 1. Ensure RLS is enabled
ALTER TABLE public.user_vip_status ENABLE ROW LEVEL SECURITY;

-- 2. Clean up old policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all VIP statuses" ON public.user_vip_status;
DROP POLICY IF EXISTS "Admins manage VIP status" ON public.user_vip_status;
DROP POLICY IF EXISTS "Anyone can view VIP status" ON public.user_vip_status;
DROP POLICY IF EXISTS "Public view VIP status" ON public.user_vip_status;
DROP POLICY IF EXISTS "Users can view their own VIP status" ON public.user_vip_status;
DROP POLICY IF EXISTS "Admins manage VIP" ON public.user_vip_status;

-- 3. SELECT Policy: Everyone can view VIP status
-- This is crucial for the "upsert" and "returning" calls to work,
-- and also for the global chat view to see who is VIP.
CREATE POLICY "Anyone can view VIP status" 
ON public.user_vip_status 
FOR SELECT 
USING (true);

-- 4. ALL Policy for Admins: Can insert, update, and delete
-- We use a robust check for admin status
CREATE POLICY "Admins manage all VIP status" 
ON public.user_vip_status 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (COALESCE(is_admin, false) = true OR role = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (COALESCE(is_admin, false) = true OR role = 'admin')
  )
);

-- 5. Helpful: Also ensure the notifications table is accessible for admins
-- since the VIP grant process also sends a notification.
DROP POLICY IF EXISTS "System/Admins insert notifications" ON public.notifications;
CREATE POLICY "System/Admins insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- 6. Grant permissions just in case
GRANT ALL ON public.user_vip_status TO authenticated;
GRANT SELECT ON public.user_vip_status TO anon;
