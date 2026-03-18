-- DATABASE TRIGGER VERSION (Ultimate Guarantee)
-- This ensures notifications happen AT THE DATABASE LEVEL, bypassing all JS/Client/RLS issues.

-- 1. Create the notification function
CREATE OR REPLACE FUNCTION public.notify_admins_of_scrim_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to bypass RLS for inserting notifications
AS $$
DECLARE
    admin_id UUID;
    v_team_name TEXT;
BEGIN
    -- Get team name for the message
    SELECT team_name INTO v_team_name FROM public.teams WHERE id = NEW.team_id;

    -- For each admin/manager, create a notification
    FOR admin_id IN (
        SELECT id FROM public.profiles 
        WHERE is_admin = true OR role = 'admin'
    ) LOOP
        INSERT INTO public.notifications (user_id, title, message, type, is_read, created_at)
        VALUES (
            admin_id, 
            'ახალი თამაშის მოთხოვნა 🎮', 
            'გუნდმა ''' || COALESCE(v_team_name, 'Unknown') || ''' გამოგზავნა თამაშის მოთხოვნა.', 
            'info', 
            false, 
            NOW()
        );
    END LOOP;

    RETURN NEW;
END;
$$;

-- 2. Attach trigger to scrim_requests table
DROP TRIGGER IF EXISTS on_scrim_request_notify_admins ON public.scrim_requests;
CREATE TRIGGER on_scrim_request_notify_admins
  AFTER INSERT ON public.scrim_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_of_scrim_request();

-- 3. Reload schema
NOTIFY pgrst, 'reload schema';
