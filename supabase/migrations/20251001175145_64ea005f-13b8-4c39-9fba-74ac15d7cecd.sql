-- Create officials table that references residents
CREATE TABLE public.officials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  term_start DATE NOT NULL,
  term_end DATE,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(resident_id, position)
);

-- Enable Row Level Security
ALTER TABLE public.officials ENABLE ROW LEVEL SECURITY;

-- Create policies for officials
CREATE POLICY "Authenticated users can view all officials"
ON public.officials
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create officials"
ON public.officials
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update officials"
ON public.officials
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete officials"
ON public.officials
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_officials_updated_at
BEFORE UPDATE ON public.officials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();