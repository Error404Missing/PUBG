-- =====================================================
-- FIX: SCHEDULE DELETION AND RLS POLICIES
-- =====================================================

-- 1. Robustly handle foreign key cascades for schedules
DO $$
DECLARE
    r record;
BEGIN
    -- Drop ALL existing foreign keys referencing schedules(id) from scrim_requests
    FOR r IN (
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = 'scrim_requests' 
        AND tc.table_schema = 'public' 
        AND kcu.column_name = 'schedule_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE public.scrim_requests DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
    
    -- Drop ALL existing foreign keys referencing schedules(id) from results
    FOR r IN (
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = 'results' 
        AND tc.table_schema = 'public' 
        AND kcu.column_name = 'schedule_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE public.results DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 2. Add back constraints with ON DELETE CASCADE to ensure cleanup
ALTER TABLE public.scrim_requests 
ADD CONSTRAINT scrim_requests_schedule_id_fkey 
FOREIGN KEY (schedule_id) 
REFERENCES public.schedules(id) 
ON DELETE CASCADE;

ALTER TABLE public.results 
ADD CONSTRAINT results_schedule_id_fkey 
FOREIGN KEY (schedule_id) 
REFERENCES public.schedules(id) 
ON DELETE CASCADE;

-- 3. Robust RLS Policies for Schedules
-- We use EXISTS instead of IN for better performance and fewer recursion issues
DROP POLICY IF EXISTS "Anyone can view schedules" ON public.schedules;
CREATE POLICY "Anyone can view schedules" ON public.schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert schedules" ON public.schedules;
CREATE POLICY "Admins can insert schedules" ON public.schedules FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  )
);

DROP POLICY IF EXISTS "Admins can update schedules" ON public.schedules;
CREATE POLICY "Admins can update schedules" ON public.schedules FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  )
);

DROP POLICY IF EXISTS "Admins can delete schedules" ON public.schedules;
CREATE POLICY "Admins can delete schedules" ON public.schedules FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  )
);

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
