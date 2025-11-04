-- Add location columns to households table
ALTER TABLE public.households
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Add index for spatial queries (optional but useful for performance)
CREATE INDEX idx_households_location ON public.households(latitude, longitude);