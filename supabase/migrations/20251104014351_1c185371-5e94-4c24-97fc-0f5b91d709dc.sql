-- Create certificate_types enum
CREATE TYPE public.certificate_type AS ENUM (
  'barangay_clearance',
  'certificate_of_residency',
  'certificate_of_indigency',
  'business_permit',
  'good_moral',
  'first_time_job_seeker'
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_type certificate_type NOT NULL,
  resident_id UUID REFERENCES public.residents(id) ON DELETE SET NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  purpose TEXT,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  issued_by TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Certificates policies
CREATE POLICY "Authenticated users can view all certificates"
ON public.certificates
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create certificates"
ON public.certificates
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update certificates"
ON public.certificates
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete certificates"
ON public.certificates
FOR DELETE
USING (true);

-- Create trigger for certificates updated_at
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create document_categories enum
CREATE TYPE public.document_category AS ENUM (
  'resolution',
  'memorandum',
  'ordinance',
  'report',
  'financial',
  'legal',
  'correspondence',
  'other'
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category document_category NOT NULL,
  document_number TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  tags TEXT[],
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Authenticated users can view all documents"
ON public.documents
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create documents"
ON public.documents
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents"
ON public.documents
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete documents"
ON public.documents
FOR DELETE
USING (true);

-- Create trigger for documents updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'text/plain']
);

-- Storage policies for documents bucket
CREATE POLICY "Authenticated users can view documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');