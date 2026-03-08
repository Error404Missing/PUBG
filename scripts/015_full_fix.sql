-- =====================================================
-- FULL FIX SCRIPT - Run this in Supabase SQL Editor
-- =====================================================

-- 1. profiles ცხრილში ბანის სვეტები
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason text,
  ADD COLUMN IF NOT EXISTS ban_until timestamp with time zone;

-- 2. teams/profiles კავშირის გასწორება (schema cache fix)
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_leader_id_fkey;
ALTER TABLE public.teams
  ADD CONSTRAINT teams_leader_id_fkey
  FOREIGN KEY (leader_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- 3. scrim_requests ცხრილის RLS - ნებისმიერ auth user-ს შეუძლია ჩასმა
DROP POLICY IF EXISTS "Users can insert scrim requests" ON public.scrim_requests;
CREATE POLICY "Users can insert scrim requests"
  ON public.scrim_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams WHERE leader_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can read scrim requests" ON public.scrim_requests;
CREATE POLICY "Anyone can read scrim requests"
  ON public.scrim_requests
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can update scrim requests" ON public.scrim_requests;
CREATE POLICY "Admins can update scrim requests"
  ON public.scrim_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 4. results ცხრილის RLS - ადმინებს გამოქვეყნება და წაშლა
DROP POLICY IF EXISTS "Admins can delete results" ON public.results;
CREATE POLICY "Admins can delete results"
  ON public.results
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can insert results" ON public.results;
CREATE POLICY "Admins can insert results"
  ON public.results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Anyone can read results" ON public.results;
CREATE POLICY "Anyone can read results"
  ON public.results
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. profiles RLS - admins can update ban fields
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 6. Schema Cache-ის გადატვირთვა
NOTIFY pgrst, 'reload schema';
