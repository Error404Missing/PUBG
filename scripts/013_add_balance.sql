-- Add balance column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0;

-- Function to safely deduct balance
CREATE OR REPLACE FUNCTION public.deduct_balance(user_id UUID, amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  SELECT balance INTO current_balance FROM profiles WHERE id = user_id;
  IF current_balance >= amount THEN
    UPDATE profiles SET balance = balance - amount WHERE id = user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Function to safely add balance (topup by admin)
CREATE OR REPLACE FUNCTION public.add_balance(target_user_id UUID, amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- We assume authorization is handled by RLS on profiles, but since this is SECURITY DEFINER,
  -- we should verify the caller is admin.
  IF EXISTS (SELECT 1 FROM profiles where id = auth.uid() AND (is_admin = true OR role = 'admin')) THEN
    UPDATE profiles SET balance = balance + amount WHERE id = target_user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;
