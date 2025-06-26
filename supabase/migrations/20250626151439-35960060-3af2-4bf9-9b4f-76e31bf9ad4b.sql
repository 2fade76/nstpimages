
-- Update the check constraint on the photographers table to include the new staff_oc status
ALTER TABLE public.photographers 
DROP CONSTRAINT IF EXISTS photographers_status_check;

ALTER TABLE public.photographers 
ADD CONSTRAINT photographers_status_check 
CHECK (status IN ('staff', 'stringers', 'staff_oc'));
