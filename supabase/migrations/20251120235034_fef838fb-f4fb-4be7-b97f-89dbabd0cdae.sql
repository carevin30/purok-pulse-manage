-- Create storage bucket for official photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('official-photos', 'official-photos', true);

-- Create RLS policies for official photos
CREATE POLICY "Anyone can view official photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'official-photos');

CREATE POLICY "Authenticated users can upload official photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'official-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update official photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'official-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete official photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'official-photos' 
  AND auth.role() = 'authenticated'
);

-- Update validation function to handle the 4 position types
CREATE OR REPLACE FUNCTION public.validate_official_position()
RETURNS TRIGGER AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  -- Validate position is one of the allowed values
  IF NEW.position NOT IN ('Barangay Captain', 'Secretary', 'Kagawad', 'Tanod') THEN
    RAISE EXCEPTION 'Position must be one of: Barangay Captain, Secretary, Kagawad, Tanod';
  END IF;

  -- Only check for Active officials
  IF NEW.status = 'Active' THEN
    -- Check for Barangay Captain (only one allowed)
    IF NEW.position = 'Barangay Captain' THEN
      SELECT COUNT(*) INTO existing_count
      FROM public.officials
      WHERE position = 'Barangay Captain' 
      AND status = 'Active'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
      
      IF existing_count > 0 THEN
        RAISE EXCEPTION 'Only one active Barangay Captain is allowed';
      END IF;
    END IF;
    
    -- Check for Secretary (only one allowed)
    IF NEW.position = 'Secretary' THEN
      SELECT COUNT(*) INTO existing_count
      FROM public.officials
      WHERE position = 'Secretary' 
      AND status = 'Active'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
      
      IF existing_count > 0 THEN
        RAISE EXCEPTION 'Only one active Secretary is allowed';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;