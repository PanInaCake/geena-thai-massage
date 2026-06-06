-- Fix: Ensure get_booking_availability bypasses RLS properly
-- The function now uses SECURITY DEFINER and should execute with elevated privileges

-- First, drop the existing function
DROP FUNCTION IF EXISTS public.get_booking_availability(text);

-- Create the fixed function that properly handles RLS
CREATE OR REPLACE FUNCTION public.get_booking_availability(p_booking_date text)
RETURNS TABLE (booking_time text, package text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT b.booking_time, b.package
  FROM public.bookings b
  WHERE b.booking_date = p_booking_date::date
  ORDER BY b.booking_time;
END;
$$;

-- Ensure proper permissions
REVOKE ALL ON FUNCTION public.get_booking_availability(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booking_availability(text) TO authenticated;
