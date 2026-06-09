-- Expose booking time + duration for a date without revealing customer PII.
CREATE OR REPLACE FUNCTION public.get_booking_availability(p_booking_date date)
RETURNS TABLE (booking_time text, package text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.booking_time, b.package
  FROM public.bookings b
  WHERE b.booking_date = p_booking_date;
$$;

REVOKE ALL ON FUNCTION public.get_booking_availability(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booking_availability(date) TO authenticated;