-- Fix VIP status RLS policies
-- Drop conflicting policies
DROP POLICY IF EXISTS "System can upsert VIP status" ON public.user_vip_status;
DROP POLICY IF EXISTS "System can update VIP status" ON public.user_vip_status;
DROP POLICY IF EXISTS "Everyone can view VIP status" ON public.user_vip_status;

-- Recreate with simpler, non-conflicting policies
CREATE POLICY "Allow public read VIP status" ON public.user_vip_status
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own VIP status" ON public.user_vip_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own VIP status" ON public.user_vip_status
  FOR UPDATE USING (auth.uid() = user_id);
