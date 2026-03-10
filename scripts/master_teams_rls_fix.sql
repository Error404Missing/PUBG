-- =====================================================
-- MASTER RLS FIX FOR TEAMS - EXPLICIT ADMIN ACCESS
-- =====================================================

-- 1. Sync admin permissions one more time
UPDATE public.profiles SET is_admin = true, role = 'admin' 
WHERE email IN (SELECT email FROM auth.users WHERE email LIKE '%admin%' OR email = 'baska1337@gmail.com');

-- 2. Wipe ALL existing policies on teams table to start fresh
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'teams' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.teams', pol.policyname);
    END LOOP;
END $$;

-- 3. Create clean, robust policies
-- Admins: FULL ACCESS to everything
CREATE POLICY "Admin_Full_Access" ON public.teams
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

-- Users: View approved teams or their own
CREATE POLICY "User_View_Approved" ON public.teams
  FOR SELECT
  USING (status = 'approved' OR leader_id = auth.uid());

-- Users: Manage their own teams
CREATE POLICY "User_Insert_Own" ON public.teams
  FOR INSERT
  WITH CHECK (leader_id = auth.uid());

CREATE POLICY "User_Update_Own" ON public.teams
  FOR UPDATE
  USING (leader_id = auth.uid());

CREATE POLICY "User_Delete_Own" ON public.teams
  FOR DELETE
  USING (leader_id = auth.uid());

-- 4. Reload Schema
NOTIFY pgrst, 'reload schema';
