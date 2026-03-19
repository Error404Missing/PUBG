-- Add ban reason and ban until to teams table
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS ban_until TIMESTAMP WITH TIME ZONE;

-- Add a comment for clarity
COMMENT ON COLUMN public.teams.ban_reason IS 'Reason for team disqualification/ban';
COMMENT ON COLUMN public.teams.ban_until IS 'Timestamp when the team ban expires. NULL means permanent.';
