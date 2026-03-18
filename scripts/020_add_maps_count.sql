-- Add maps_count to schedules (how many maps this match will have)
ALTER TABLE public.schedules 
ADD COLUMN IF NOT EXISTS maps_count INTEGER DEFAULT 4 
CHECK (maps_count IN (1, 2, 3, 4));

-- Add preferred_maps to scrim_requests (how many maps the team wants to play)
ALTER TABLE public.scrim_requests 
ADD COLUMN IF NOT EXISTS preferred_maps INTEGER DEFAULT 4
CHECK (preferred_maps IN (1, 2, 3, 4));

-- Reload schema
NOTIFY pgrst, 'reload schema';
