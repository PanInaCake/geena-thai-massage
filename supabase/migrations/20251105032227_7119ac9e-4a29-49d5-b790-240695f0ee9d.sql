-- Create a helper function to set session variables
CREATE OR REPLACE FUNCTION public.set_config(setting_name TEXT, setting_value TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config(setting_name, setting_value, false);
END;
$$;