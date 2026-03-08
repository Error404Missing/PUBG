-- Add requested status to teams
-- Adding new status for when team is created but not yet requested to join scrim
ALTER TABLE public.teams 
  DROP CONSTRAINT IF EXISTS teams_status_check;

ALTER TABLE public.teams 
  ADD CONSTRAINT teams_status_check 
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'blocked'));

-- Update existing teams with 'pending' status to stay as 'pending'
-- New teams will be created with 'draft' status
-- </CHANGE>
