-- =====================================================
-- ADMIN RLS AND ACTION FIX
-- =====================================================

-- Ensure profiles is_admin is synced with role 'admin'
UPDATE public.profiles SET is_admin = true WHERE role = 'admin';

-- Drop any potentially conflicting policies on teams
DROP POLICY IF EXISTS "Admins can update any team" ON public.teams;
DROP POLICY IF EXISTS "Admins can delete teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can view all teams" ON public.teams;

-- Create robust admin policies for teams
CREATE POLICY "Admins can view any team" ON public.teams
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "Admins can update any team" ON public.teams
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

CREATE POLICY "Admins can delete any team" ON public.teams
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- Ensure notifications also follow this
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
    OR user_id = auth.uid()
  );

NOTIFY pgrst, 'reload schema';
