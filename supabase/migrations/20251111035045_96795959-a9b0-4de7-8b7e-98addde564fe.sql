-- Add notes column to bookings table
ALTER TABLE public.bookings
ADD COLUMN notes TEXT;