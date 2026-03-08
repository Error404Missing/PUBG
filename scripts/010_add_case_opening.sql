-- Case Opening System
-- Users can open a case every 2 weeks to win VIP status

-- Create case_openings table to track user case opens
CREATE TABLE IF NOT EXISTS public.case_openings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward TEXT NOT NULL, -- 'nothing', 'vip_1_day', 'vip_3_days', 'vip_1_week'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_vip_status table to track VIP expiration
CREATE TABLE IF NOT EXISTS public.user_vip_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  vip_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.case_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vip_status ENABLE ROW LEVEL SECURITY;

-- Policies for case_openings
CREATE POLICY "Users can view their own case openings" ON public.case_openings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own case openings" ON public.case_openings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for user_vip_status
-- Allow viewing own VIP status
CREATE POLICY "Users can view their own VIP status" ON public.user_vip_status
  FOR SELECT USING (auth.uid() = user_id);

-- Allow public viewing for display purposes
CREATE POLICY "Everyone can view any VIP status" ON public.user_vip_status
  FOR SELECT USING (true);

-- Allow users to insert their own VIP status
CREATE POLICY "Users can insert their own VIP status" ON public.user_vip_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own VIP status
CREATE POLICY "Users can update their own VIP status" ON public.user_vip_status
  FOR UPDATE USING (auth.uid() = user_id);
