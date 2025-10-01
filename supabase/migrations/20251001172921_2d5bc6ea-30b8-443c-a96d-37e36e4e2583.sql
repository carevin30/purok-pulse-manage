-- Add utility connection columns to households table
ALTER TABLE public.households 
ADD COLUMN IF NOT EXISTS has_electricity boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_water boolean DEFAULT false;