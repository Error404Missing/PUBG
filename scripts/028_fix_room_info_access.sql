-- 1. Ensure leaders can always see their own teams, even if they aren't approved yet
-- This prevents JOIN failures in the Room Info page
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'teams' AND policyname = 'Team leaders can view their own team'
    ) THEN
        CREATE POLICY "Team leaders can view their own team" ON public.teams
        FOR SELECT USING (auth.uid() = leader_id);
    END IF;
END
$$;

-- 2. Ensure anyone can see scrim_requests (for join purposes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'scrim_requests' AND policyname = 'Anyone can view scrim requests'
    ) THEN
        CREATE POLICY "Anyone can view scrim requests" ON public.scrim_requests
        FOR SELECT USING (true);
    END IF;
END
$$;

-- 3. Ensure schedules columns exist for specific room details
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS room_map TEXT;
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS room_time TEXT;

-- 4. Sync profile roles for managers who lead approved teams
-- This ensures the "ROOM INFO" nav item appears correctly
UPDATE public.profiles p
SET role = 'manager'
FROM public.teams t
WHERE t.leader_id = p.id 
  AND t.status = 'approved'
  AND (p.role IS NULL OR p.role NOT IN ('admin', 'manager'))
  AND p.is_admin = false;
