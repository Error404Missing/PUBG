-- Create scrim_requests table to track team requests for scrim events
CREATE TABLE IF NOT EXISTS public.scrim_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, schedule_id)
);

-- Enable RLS
ALTER TABLE public.scrim_requests ENABLE ROW LEVEL SECURITY;

-- Policies for scrim_requests
CREATE POLICY "Anyone can view scrim requests" ON public.scrim_requests
  FOR SELECT USING (true);

CREATE POLICY "Team leaders can insert requests for their team" ON public.scrim_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = team_id AND leader_id = auth.uid()
    )
  );

CREATE POLICY "Team leaders can update their own requests" ON public.scrim_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = team_id AND leader_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update any request" ON public.scrim_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete requests" ON public.scrim_requests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
