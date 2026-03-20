-- 1. DROP and RECREATE teams policies to be absolutely certain
DROP POLICY IF EXISTS "Anyone can view approved teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can view all teams" ON public.teams;
DROP POLICY IF EXISTS "Users can insert their own team" ON public.teams;
DROP POLICY IF EXISTS "Team leaders can view their own team" ON public.teams;
DROP POLICY IF EXISTS "Team leaders can update their own team" ON public.teams;
DROP POLICY IF EXISTS "Everyone can select teams" ON public.teams;

-- New Clean Policies for teams
CREATE POLICY "Anyone can select approved teams" ON public.teams
FOR SELECT USING (status = 'approved');

CREATE POLICY "Leaders can select their own teams regardless of status" ON public.teams
FOR SELECT USING (auth.uid() = leader_id);

CREATE POLICY "Admins have full select access to teams" ON public.teams
FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- 2. Scrim Requests Policies Fix
DROP POLICY IF EXISTS "Anyone can view scrim requests" ON public.scrim_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.scrim_requests;

CREATE POLICY "Public select on scrim_requests" ON public.scrim_requests
FOR SELECT USING (true);

-- 3. Profiles Role Sync (CRITICAL for navigation visibility)
UPDATE public.profiles p
SET role = 'manager'
FROM public.teams t
WHERE t.leader_id = p.id 
  AND (t.status = 'approved' OR t.status = 'pending')
  AND p.role NOT IN ('admin', 'manager')
  AND p.is_admin = false;

UPDATE public.profiles SET is_admin = true WHERE role = 'admin';

-- 4. Sync slot and status (just in case they were mismatched)
-- If a request is approved, the team must be approved too
UPDATE public.teams t
SET status = 'approved'
FROM public.scrim_requests r
WHERE r.team_id = t.id 
  AND r.status = 'approved'
  AND t.status != 'approved';
