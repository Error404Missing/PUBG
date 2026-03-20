-- Function to return current auth.uid() for debugging
CREATE OR REPLACE FUNCTION get_my_auth_id() 
RETURNS uuid 
LANGUAGE plpgsql 
SECURITY INVOKER
AS $$
BEGIN
  RETURN auth.uid();
END;
$$;
