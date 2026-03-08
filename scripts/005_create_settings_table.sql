-- Create site_settings table for storing configurable links and settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Settings policies
CREATE POLICY "Anyone can view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.site_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can insert settings" ON public.site_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Insert default settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('discord_invite_link', 'https://discord.gg/your-invite-link', 'Discord სერვერის მოწვევის ბმული'),
  ('telegram_link', 'https://t.me/your-channel', 'Telegram არხის ბმული'),
  ('facebook_link', 'https://facebook.com/your-page', 'Facebook გვერდის ბმული'),
  ('youtube_link', 'https://youtube.com/@your-channel', 'YouTube არხის ბმული'),
  ('contact_email', 'contact@pubgarena.ge', 'საკონტაქტო ელ-ფოსტა'),
  ('contact_discord', 'admin#1234', 'Discord საკონტაქტო Username')
ON CONFLICT (key) DO NOTHING;
