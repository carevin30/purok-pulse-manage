-- Create residents table
CREATE TABLE public.residents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  purok TEXT,
  street_address TEXT,
  phone_number TEXT,
  email TEXT,
  barangay_id_number TEXT UNIQUE,
  household_id UUID,
  is_senior_citizen BOOLEAN DEFAULT FALSE,
  is_pwd BOOLEAN DEFAULT FALSE,
  is_indigenous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Deceased')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view all residents" 
ON public.residents 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create residents" 
ON public.residents 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update residents" 
ON public.residents 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete residents" 
ON public.residents 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_residents_updated_at
BEFORE UPDATE ON public.residents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_residents_household_id ON public.residents(household_id);
CREATE INDEX idx_residents_status ON public.residents(status);
CREATE INDEX idx_residents_barangay_id ON public.residents(barangay_id_number);