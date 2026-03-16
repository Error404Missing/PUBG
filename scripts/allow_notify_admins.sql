-- Allow authenticated users to insert notifications for admins
-- This is needed for the support chat notification system
CREATE POLICY "Anyone can notify admins"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = notifications.user_id 
      AND (is_admin = true OR role = 'admin')
    )
  );
