-- Drop the public SELECT policy
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;

-- Create a table to store authorized access codes
CREATE TABLE public.booking_access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on access codes table
ALTER TABLE public.booking_access_codes ENABLE ROW LEVEL SECURITY;

-- Only allow reading access codes with valid authentication (for future admin panel)
CREATE POLICY "Service role can manage access codes"
ON public.booking_access_codes
FOR ALL
USING (auth.role() = 'service_role');

-- Create a security definer function to check if an access code is valid
CREATE OR REPLACE FUNCTION public.verify_booking_access(access_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.booking_access_codes
    WHERE code = access_code
  )
$$;

-- Create a new RLS policy that requires a valid access code
CREATE POLICY "Authorized users can view bookings"
ON public.bookings
FOR SELECT
USING (
  public.verify_booking_access(current_setting('app.access_code', true))
);

-- Insert a default access code (you can change this or add more codes)
INSERT INTO public.booking_access_codes (code, name)
VALUES ('ADMIN2025', 'Default Admin Access');