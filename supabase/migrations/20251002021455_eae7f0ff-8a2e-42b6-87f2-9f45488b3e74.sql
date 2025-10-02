-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  organizer TEXT,
  participants_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities
CREATE POLICY "Authenticated users can view all activities"
ON public.activities
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create activities"
ON public.activities
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update activities"
ON public.activities
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete activities"
ON public.activities
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();