-- Add last_seen_at column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable realtime for profiles to see online status live if needed (optional but good for future)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
