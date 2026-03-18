-- Fix schedule deletion so blocked teams remain in the database
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
ON DELETE SET NULL;

-- Create function to manually delete non-blocked teams before a schedule is deleted
CREATE OR REPLACE FUNCTION public.handle_schedule_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all non-blocked teams associated with this schedule
  DELETE FROM public.teams 
  WHERE schedule_id = OLD.id AND status != 'blocked';
  
  -- Blocked teams will automatically have schedule_id set to NULL due to ON DELETE SET NULL
  
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_schedule_delete ON public.schedules;
CREATE TRIGGER on_schedule_delete
  BEFORE DELETE ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_schedule_deletion();

NOTIFY pgrst, 'reload schema';
