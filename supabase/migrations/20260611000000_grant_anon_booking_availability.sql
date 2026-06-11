-- Allow anonymous (public booking page) users to check slot availability.
GRANT EXECUTE ON FUNCTION public.get_booking_availability(text) TO anon;
