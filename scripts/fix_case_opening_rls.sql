-- Fix for Case Opening System RLS
-- Ensure the table and policies are correctly set up to prevent multi-opening

-- 1. Ensure RLS is enabled on case_openings
ALTER TABLE public.case_openings ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing policies for case_openings
DROP POLICY IF EXISTS "Users can view their own case openings" ON public.case_openings;
DROP POLICY IF EXISTS "Users can insert their own case openings" ON public.case_openings;
DROP POLICY IF EXISTS "Admins can view all case openings" ON public.case_openings;

-- 3. Create robust policies for case_openings
-- Users can view only their own openings
CREATE POLICY "Users can view their own case openings" 
ON public.case_openings
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own openings
CREATE POLICY "Users can insert their own case openings" 
ON public.case_openings
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view everything
CREATE POLICY "Admins can view all case openings" 
ON public.case_openings
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (COALESCE(is_admin, false) = true OR role = 'admin')
  )
);

-- 4. Fix user_vip_status to allow users to update their own status (needed for winning cases)
-- Note: We still want admins to have full control, but we must allow the client side 
-- to update its own VIP status if we aren't using a backend function.
-- To make it safer, we only allow updates to own row.
DROP POLICY IF EXISTS "Users can update their own VIP status" ON public.user_vip_status;
CREATE POLICY "Users can update their own VIP status" 
ON public.user_vip_status 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own VIP status" ON public.user_vip_status;
CREATE POLICY "Users can insert their own VIP status" 
ON public.user_vip_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Grant permissions
GRANT ALL ON public.case_openings TO authenticated;
GRANT ALL ON public.user_vip_status TO authenticated;
