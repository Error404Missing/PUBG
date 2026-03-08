-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'guest' CHECK (role IN ('guest', 'manager', 'admin'));

-- Update existing admins to have admin role
UPDATE public.profiles SET role = 'admin' WHERE is_admin = true;

-- Add room info columns to teams table
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS room_id TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS room_password TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;

-- Create function to automatically set manager role when team is approved
CREATE OR REPLACE FUNCTION set_manager_role_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If team status changed to approved, set the leader's role to manager
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.profiles 
    SET role = 'manager' 
    WHERE id = NEW.leader_id AND role = 'guest';
  END IF;
  
  -- If team status changed from approved to something else, revert to guest (unless admin)
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE public.profiles 
    SET role = 'guest' 
    WHERE id = NEW.leader_id AND role = 'manager';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for the function
DROP TRIGGER IF EXISTS on_team_status_change ON public.teams;
CREATE TRIGGER on_team_status_change
  AFTER INSERT OR UPDATE OF status ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION set_manager_role_on_approval();
