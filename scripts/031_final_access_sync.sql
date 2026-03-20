-- Definitive RLS fix for access issues (V2 - removed non-existent col)
-- 1. Ensure anyone can see scrim requests
DROP POLICY IF EXISTS "Anyone can view scrim requests" ON public.scrim_requests;
DROP POLICY IF EXISTS "Public select on scrim_requests" ON public.scrim_requests;
DROP POLICY IF EXISTS "scrim_requests_public_select" ON public.scrim_requests;
CREATE POLICY "scrim_requests_public_select" ON public.scrim_requests FOR SELECT USING (true);

-- 2. Ensure leaders can see their own teams 
DROP POLICY IF EXISTS "Leaders view own teams" ON public.teams;
DROP POLICY IF EXISTS "leaders_view_own_teams_v2" ON public.teams;
CREATE POLICY "leaders_view_own_teams_v2" ON public.teams FOR SELECT USING (leader_id = auth.uid());

-- 3. Ensure admins can see everything on teams
DROP POLICY IF EXISTS "Admins view all teams" ON public.teams;
DROP POLICY IF EXISTS "admins_view_all_teams_v2" ON public.teams;
CREATE POLICY "admins_view_all_teams_v2" ON public.teams FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  )
);

-- 4. Sync status for safety (if a request is approved, ensure team is approved too)
UPDATE public.teams t
SET status = 'approved'
FROM public.scrim_requests r
WHERE t.id = r.team_id 
AND r.status = 'approved';
