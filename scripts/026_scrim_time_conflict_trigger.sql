-- Function to check for time conflicts in scrim requests
CREATE OR REPLACE FUNCTION public.check_scrim_time_conflict()
RETURNS TRIGGER AS $$
DECLARE
    target_date TIMESTAMP WITH TIME ZONE;
    conflict_exists BOOLEAN;
BEGIN
    -- Only check if the status is being set to 'approved'
    IF NEW.status = 'approved' THEN
        -- Get the date of the new schedule
        SELECT date INTO target_date FROM public.schedules WHERE id = NEW.schedule_id;

        -- Check if any team led by the same person already has an approved request for the same time
        SELECT EXISTS (
            SELECT 1 
            FROM public.scrim_requests sr
            JOIN public.schedules s ON s.id = sr.schedule_id
            JOIN public.teams t_current ON t_current.id = NEW.team_id
            JOIN public.teams t_other ON t_other.id = sr.team_id
            -- Check if same leader has conflict
            WHERE t_other.leader_id = (SELECT leader_id FROM public.teams WHERE id = NEW.team_id)
            AND sr.status = 'approved'
            AND s.date = target_date
            AND (sr.id IS NULL OR sr.id != NEW.id)
        ) INTO conflict_exists;

        IF conflict_exists THEN
            RAISE EXCEPTION 'მომხმარებელს უკვე აქვს დადასტურებული მატჩი ამ დროს (სხვა გუნდით ან სხვა ოთახში).';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the check before update or insert
DROP TRIGGER IF EXISTS tr_check_scrim_time_conflict ON public.scrim_requests;
CREATE TRIGGER tr_check_scrim_time_conflict
BEFORE INSERT OR UPDATE ON public.scrim_requests
FOR EACH ROW EXECUTE FUNCTION public.check_scrim_time_conflict();
