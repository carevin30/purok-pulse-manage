-- Add photo_url column to officials table
ALTER TABLE public.officials 
ADD COLUMN photo_url TEXT;

-- Create function to validate unique positions
CREATE OR REPLACE FUNCTION public.validate_official_position()
RETURNS TRIGGER AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  -- Only check for Active officials
  IF NEW.status = 'Active' THEN
    -- Check for Barangay Captain
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
    
    -- Check for Secretary
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
$$ LANGUAGE plpgsql;

-- Create trigger for position validation
DROP TRIGGER IF EXISTS validate_official_position_trigger ON public.officials;
CREATE TRIGGER validate_official_position_trigger
  BEFORE INSERT OR UPDATE ON public.officials
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_official_position();