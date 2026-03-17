-- 1. Change Foreign Key constraint for teams.schedule_id to CASCADE
-- First, we need to find the constraint name. Usually it's teams_schedule_id_fkey
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'teams_schedule_id_fkey' 
        AND table_name = 'teams'
    ) THEN
        ALTER TABLE public.teams DROP CONSTRAINT teams_schedule_id_fkey;
    END IF;
END $$;

ALTER TABLE public.teams 
ADD CONSTRAINT teams_schedule_id_fkey 
FOREIGN KEY (schedule_id) 
REFERENCES public.schedules(id) 
ON DELETE CASCADE;

-- 2. Create function to handle role revocation on team deletion
CREATE OR REPLACE FUNCTION public.handle_team_deletion_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the leader still has any OTHER approved teams
  IF NOT EXISTS (
    SELECT 1 FROM public.teams 
    WHERE leader_id = OLD.leader_id 
    AND status = 'approved' 
    AND id != OLD.id
  ) THEN
    -- If no other approved teams, and they are currently a manager, downgrade to guest
    UPDATE public.profiles 
    SET role = 'guest' 
    WHERE id = OLD.leader_id AND role = 'manager';
  END IF;
  
  RETURN OLD;
END;
$$;

-- 3. Create trigger for team deletion
DROP TRIGGER IF EXISTS on_team_delete_role ON public.teams;
CREATE TRIGGER on_team_delete_role
  AFTER DELETE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_team_deletion_role();

-- 4. Update the manual cleanup function to also be available if needed, 
-- but we don't need the 10h interval anymore if we rely on schedule deletion.
-- However, for now, let's just keep the schedule-linked logic as requested.

COMMENT ON TRIGGER on_team_delete_role ON public.teams IS 'Revokes manager role if the user has no more approved teams after deletion.';
