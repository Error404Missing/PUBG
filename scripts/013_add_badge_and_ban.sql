-- Add badge and is_banned columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badge text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason text DEFAULT NULL;

-- Add has_vip column to scrim_requests if it doesn't exist
ALTER TABLE public.scrim_requests ADD COLUMN IF NOT EXISTS has_vip boolean DEFAULT false;
