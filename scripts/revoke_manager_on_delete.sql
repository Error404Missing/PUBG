-- Trigger: when a team is deleted, revoke manager role from the leader
CREATE OR REPLACE FUNCTION revoke_manager_on_team_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Downgrade the deleted team's leader from manager -> guest
  -- Only if they are currently "manager" (don't touch admins)
  UPDATE public.profiles
  SET role = 'guest'
  WHERE id = OLD.leader_id
    AND role = 'manager';

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_team_delete ON public.teams;

-- Create new trigger
CREATE TRIGGER on_team_delete
  AFTER DELETE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION revoke_manager_on_team_delete();
