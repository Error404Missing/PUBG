-- Function to automatically delete teams older than 10 hours
-- and revoke manager role from their leaders.

CREATE OR REPLACE FUNCTION public.cleanup_expired_teams()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
  record record;
BEGIN
  deleted_count := 0;
  
  FOR record IN 
    SELECT id, leader_id FROM public.teams WHERE created_at < NOW() - INTERVAL '10 hours'
  LOOP
    -- revoke manager role if they are only managers
    UPDATE public.profiles SET role = 'guest' WHERE id = record.leader_id AND role = 'manager';
    
    -- delete the team
    DELETE FROM public.teams WHERE id = record.id;
    deleted_count := deleted_count + 1;
  END LOOP;
  
  -- delete any old case_openings if we want, but not needed.
  
  RETURN deleted_count;
END;
$$;
