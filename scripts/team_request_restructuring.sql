-- =====================================================
-- TEAM AS REQUEST SYSTEM RESTRUCTURING
-- =====================================================

-- 1. Drop existing scrim_requests - we will use the teams table as requests now
DROP TABLE IF EXISTS public.scrim_requests CASCADE;

-- 2. Modify teams table to support being a temporary game request
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS last_request_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Add last_team_request_at to profiles for 12-hour cooldown
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_team_request_at TIMESTAMP WITH TIME ZONE;

-- 4. Create function to automatically set manager role when team is approved
-- Actually, this already exists in 006_add_roles_and_room_info.sql, but let's ensure it's correct
CREATE OR REPLACE FUNCTION set_manager_role_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If team status changed to approved, set the leader's role to manager
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.profiles 
    SET role = 'manager' 
    WHERE id = NEW.leader_id AND (role IS NULL OR role = 'guest');
  END IF;
  
  -- If team status changed from approved to something else (e.g., cancelled), revert to guest (unless admin)
  IF OLD.status = 'approved' AND (NEW.status IS NULL OR NEW.status != 'approved') THEN
    UPDATE public.profiles 
    SET role = 'guest' 
    WHERE id = NEW.leader_id AND role = 'manager';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger
DROP TRIGGER IF EXISTS on_team_status_change ON public.teams;
CREATE TRIGGER on_team_status_change
  AFTER INSERT OR UPDATE OF status ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION set_manager_role_on_approval();

-- 5. Create cleanup function to delete teams older than 10 hours
CREATE OR REPLACE FUNCTION cleanup_old_teams()
RETURNS void AS $$
BEGIN
  -- Delete teams older than 10 hours
  DELETE FROM public.teams WHERE created_at < NOW() - INTERVAL '10 hours';
  
  -- Reset roles of people who no longer have an approved team
  UPDATE public.profiles p
  SET role = 'guest'
  WHERE role = 'manager'
  AND NOT EXISTS (
    SELECT 1 FROM public.teams t 
    WHERE t.leader_id = p.id AND t.status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update Teams RLS - strictly own teams or admin
DROP POLICY IF EXISTS "Team leaders can delete their own team" ON public.teams;
CREATE POLICY "Team leaders can delete their own team" ON public.teams 
  FOR DELETE USING (auth.uid() = leader_id);

DROP POLICY IF EXISTS "Anyone can view approved teams" ON public.teams;
CREATE POLICY "Anyone can view approved teams" ON public.teams 
  FOR SELECT USING (
    status = 'approved' OR 
    leader_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))
  );

-- 7. Add last_team_request_at update trigger for teams
CREATE OR REPLACE FUNCTION update_profile_request_timer()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET last_team_request_at = NOW() 
  WHERE id = NEW.leader_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_team_creation_timer ON public.teams;
CREATE TRIGGER on_team_creation_timer
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_request_timer();

NOTIFY pgrst, 'reload schema';
