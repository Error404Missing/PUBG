-- Add slot_number and preferred_maps to scrim_requests to support multiple concurrent scrims
ALTER TABLE public.scrim_requests ADD COLUMN IF NOT EXISTS slot_number INTEGER;
ALTER TABLE public.scrim_requests ADD COLUMN IF NOT EXISTS preferred_maps INTEGER;

-- Ensure RLS allows admins to update these new columns
DROP POLICY IF EXISTS "Admins can update any request" ON public.scrim_requests;
CREATE POLICY "Admins can update any request" ON public.scrim_requests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  )
);
