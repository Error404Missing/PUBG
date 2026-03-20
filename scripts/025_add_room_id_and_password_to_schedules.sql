-- Add room_id and room_password columns to schedules table
ALTER TABLE public.schedules 
ADD COLUMN IF NOT EXISTS room_id TEXT,
ADD COLUMN IF NOT EXISTS room_password TEXT;

-- Comment on columns for clarity
COMMENT ON COLUMN public.schedules.room_id IS 'PUBG Room ID for this specific match';
COMMENT ON COLUMN public.schedules.room_password IS 'PUBG Room Password for this specific match';
