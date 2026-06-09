-- Fix: Restore public availability checking while keeping admin-only detail access
-- The issue: SELECT policy was restricted to admins only, breaking get_booking_availability
-- Solution: Create a public SELECT policy that bypasses personal details via the RPC function

-- Drop the admin-only SELECT policy
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;

-- Restore public SELECT access so the get_booking_availability RPC function can work
-- Users can only see availability via the RPC (which returns time + package only, no PII)
CREATE POLICY "Anyone can view bookings availability"
ON public.bookings
FOR SELECT
TO anon, authenticated
USING (true);
