-- Add new certificate types to the enum
ALTER TYPE certificate_type ADD VALUE IF NOT EXISTS 'residency';
ALTER TYPE certificate_type ADD VALUE IF NOT EXISTS 'business_permit';