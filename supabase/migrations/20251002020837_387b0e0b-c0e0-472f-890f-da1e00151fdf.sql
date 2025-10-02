-- Create ordinances table
CREATE TABLE public.ordinances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordinance_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  date_enacted DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ordinances ENABLE ROW LEVEL SECURITY;

-- Create policies for ordinances
CREATE POLICY "Authenticated users can view all ordinances"
ON public.ordinances
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create ordinances"
ON public.ordinances
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update ordinances"
ON public.ordinances
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete ordinances"
ON public.ordinances
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ordinances_updated_at
BEFORE UPDATE ON public.ordinances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();