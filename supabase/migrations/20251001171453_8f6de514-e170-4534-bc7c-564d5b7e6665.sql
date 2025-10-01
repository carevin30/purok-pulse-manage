-- Create households table
CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_number TEXT NOT NULL UNIQUE,
  purok TEXT,
  street_address TEXT,
  head_of_household_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- Create policies for households
CREATE POLICY "Authenticated users can view all households" 
ON public.households 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create households" 
ON public.households 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update households" 
ON public.households 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete households" 
ON public.households 
FOR DELETE 
TO authenticated
USING (true);

-- Add house_number column to residents if not exists
ALTER TABLE public.residents ADD COLUMN IF NOT EXISTS house_number TEXT;

-- Create trigger for automatic timestamp updates on households
CREATE TRIGGER update_households_updated_at
BEFORE UPDATE ON public.households
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-assign household based on house_number
CREATE OR REPLACE FUNCTION public.auto_assign_household()
RETURNS TRIGGER AS $$
DECLARE
  household_record UUID;
BEGIN
  -- Only process if house_number is provided
  IF NEW.house_number IS NOT NULL AND NEW.house_number != '' THEN
    -- Check if household exists with this house_number
    SELECT id INTO household_record
    FROM public.households
    WHERE house_number = NEW.house_number;
    
    -- If household doesn't exist, create it
    IF household_record IS NULL THEN
      INSERT INTO public.households (house_number, purok, street_address)
      VALUES (NEW.house_number, NEW.purok, NEW.street_address)
      RETURNING id INTO household_record;
    END IF;
    
    -- Assign the household_id to the resident
    NEW.household_id := household_record;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on residents table
CREATE TRIGGER assign_household_on_insert_or_update
BEFORE INSERT OR UPDATE ON public.residents
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_household();

-- Add foreign key constraint
ALTER TABLE public.households
ADD CONSTRAINT fk_head_of_household
FOREIGN KEY (head_of_household_id)
REFERENCES public.residents(id)
ON DELETE SET NULL;

-- Create indexes
CREATE INDEX idx_households_house_number ON public.households(house_number);
CREATE INDEX idx_residents_house_number ON public.residents(house_number);