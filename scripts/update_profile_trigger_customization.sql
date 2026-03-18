-- 1. Update Profile table to ensure columns exist (they should, but for safety)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 2. Update existing profiles with defaults if they are NULL
UPDATE public.profiles 
SET avatar_url = 'https://i.ibb.co/vzD7Z0M/default-avatar-dark.png' 
WHERE avatar_url IS NULL;

UPDATE public.profiles 
SET banner_url = 'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg' 
WHERE banner_url IS NULL;

-- 3. Update the handle_new_user function to include avatar and banner from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    discord_username, 
    is_admin, 
    avatar_url, 
    banner_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'discord_username', NULL),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::BOOLEAN, FALSE),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://i.ibb.co/vzD7Z0M/default-avatar-dark.png'),
    COALESCE(NEW.raw_user_meta_data->>'banner_url', 'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    banner_url = EXCLUDED.banner_url;
  
  RETURN NEW;
END;
$$;
