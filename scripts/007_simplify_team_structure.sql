-- Remove individual player fields and add simplified fields
ALTER TABLE public.teams DROP COLUMN IF EXISTS player1_ign;
ALTER TABLE public.teams DROP COLUMN IF EXISTS player1_id;
ALTER TABLE public.teams DROP COLUMN IF EXISTS player2_ign;
ALTER TABLE public.teams DROP COLUMN IF EXISTS player2_id;
ALTER TABLE public.teams DROP COLUMN IF EXISTS player3_ign;
ALTER TABLE public.teams DROP COLUMN IF EXISTS player3_id;
ALTER TABLE public.teams DROP COLUMN IF EXISTS player4_ign;
ALTER TABLE public.teams DROP COLUMN IF EXISTS player4_id;

-- Remove room info from teams table (will be global)
ALTER TABLE public.teams DROP COLUMN IF EXISTS room_id;
ALTER TABLE public.teams DROP COLUMN IF EXISTS room_password;
ALTER TABLE public.teams DROP COLUMN IF EXISTS start_time;

-- Add simplified fields
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS players_count INTEGER CHECK (players_count >= 1 AND players_count <= 4);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS maps_count INTEGER CHECK (maps_count >= 1 AND maps_count <= 4);
-- </CHANGE>

-- Add global room info to site_settings
INSERT INTO public.site_settings (key, value, description) 
VALUES 
  ('room_id', '', 'PUBG Room ID'),
  ('room_password', '', 'PUBG Room პაროლი'),
  ('start_time', '', 'თამაშის დაწყების დრო (ISO format)')
ON CONFLICT (key) DO NOTHING;
-- </CHANGE>
