
-- Remove redundant camera equipment columns from photographers table
ALTER TABLE public.photographers 
DROP COLUMN IF EXISTS camera_body,
DROP COLUMN IF EXISTS body_serialno,
DROP COLUMN IF EXISTS "Adapter",
DROP COLUMN IF EXISTS "Lens 16-35mm",
DROP COLUMN IF EXISTS "Lens 70-200mm",
DROP COLUMN IF EXISTS "Battery Grip",
DROP COLUMN IF EXISTS "Flash";
