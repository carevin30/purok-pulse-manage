-- Remove barangay_id_number column from residents table
ALTER TABLE public.residents DROP COLUMN IF EXISTS barangay_id_number;