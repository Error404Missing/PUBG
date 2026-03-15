-- ==========================================
-- ARENA PUBG MASTER MIGRATION SCRIPT
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES
-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  discord_username TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'guest' CHECK (role IN ('guest', 'manager', 'admin')),
  avatar_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  badge TEXT DEFAULT NULL,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT DEFAULT NULL,
  ban_until TIMESTAMP WITH TIME ZONE,
  last_team_request_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  map_name TEXT,
  max_teams INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  registration_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name TEXT UNIQUE NOT NULL,
  team_tag TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'blocked')),
  slot_number INTEGER,
  is_vip BOOLEAN DEFAULT FALSE,
  players_count INTEGER CHECK (players_count >= 1 AND players_count <= 4),
  maps_count INTEGER CHECK (maps_count >= 1 AND maps_count <= 4),
  logo_url TEXT DEFAULT NULL,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scrim Requests Table
CREATE TABLE IF NOT EXISTS public.scrim_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  has_vip BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, schedule_id)
);

-- Results Table
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  winner_team TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rules Table
CREATE TABLE IF NOT EXISTS public.rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VIP Status Table
CREATE TABLE IF NOT EXISTS public.user_vip_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  vip_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case Openings Table
CREATE TABLE IF NOT EXISTS public.case_openings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global Chat messages
CREATE TABLE IF NOT EXISTS public.global_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. FUNCTIONS & TRIGGERS
-- Handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, discord_username, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'discord_username', NULL),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::BOOLEAN, FALSE)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Handle Team Approval (Set Manager Role)
CREATE OR REPLACE FUNCTION set_manager_role_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.profiles 
    SET role = 'manager' 
    WHERE id = NEW.leader_id AND role = 'guest';
  END IF;
  
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE public.profiles 
    SET role = 'guest' 
    WHERE id = NEW.leader_id AND role = 'manager';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_team_status_change ON public.teams;
CREATE TRIGGER on_team_status_change
  AFTER INSERT OR UPDATE OF status ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION set_manager_role_on_approval();

-- 4. RLS POLICIES (Simplified Master Set)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vip_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_messages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- Teams
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Users can manage own team" ON public.teams FOR ALL USING (auth.uid() = leader_id);
CREATE POLICY "Admins can manage all teams" ON public.teams FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- Schedules
CREATE POLICY "Anyone can view schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Admins manage schedules" ON public.schedules FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- Site Settings
CREATE POLICY "Public view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- Global Chat
CREATE POLICY "Anyone can view global messages" ON public.global_messages FOR SELECT USING (true);
CREATE POLICY "Non-banned users insert chat" ON public.global_messages FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = false));
CREATE POLICY "Admins delete messages" ON public.global_messages FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- Notifications
CREATE POLICY "User read own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System/Admins insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Scrim Requests
CREATE POLICY "Public view scrim requests" ON public.scrim_requests FOR SELECT USING (true);
CREATE POLICY "Team lead manage own requests" ON public.scrim_requests FOR ALL USING (EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid()));
CREATE POLICY "Admins manage all requests" ON public.scrim_requests FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')));

-- 5. INITIAL SEED DATA
INSERT INTO public.site_settings (key, value, description) VALUES
  ('discord_invite_link', 'https://discord.gg/your-invite-link', 'Discord მოწვევა'),
  ('facebook_link', '#', 'Facebook'),
  ('youtube_link', '#', 'YouTube'),
  ('tiktok_link', '#', 'TikTok'),
  ('instagram_link', '#', 'Instagram'),
  ('room_id', '', 'Room ID'),
  ('room_password', '', 'Room Password'),
  ('start_time', '', 'Start Time'),
  ('map', 'Erangel', 'Map')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.rules (title, content, order_number) VALUES
  ('ზოგადი წესები', 'სამართლიანი თამაში სავალდებულოა.', 1),
  ('რეგისტრაცია', 'საიტის მეშვეობით რეგისტრაცია აუცილებელია.', 2)
ON CONFLICT DO NOTHING;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
