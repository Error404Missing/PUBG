-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.site_settings;

-- Recreate policies using both is_admin and role
CREATE POLICY "Anyone can view settings" ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can update settings" ON public.site_settings FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() 
    AND (public.profiles.is_admin = true OR public.profiles.role = 'admin')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() 
    AND (public.profiles.is_admin = true OR public.profiles.role = 'admin')
  )
);

CREATE POLICY "Admins can insert settings" ON public.site_settings FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() 
    AND (public.profiles.is_admin = true OR public.profiles.role = 'admin')
  )
);

-- Ensure permissions are granted
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE, INSERT ON public.site_settings TO authenticated;
