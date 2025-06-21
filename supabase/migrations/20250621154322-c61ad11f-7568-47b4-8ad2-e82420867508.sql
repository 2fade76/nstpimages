
-- First, let's drop the existing check constraint on status
ALTER TABLE photographers 
DROP CONSTRAINT IF EXISTS photographers_status_check;

-- Add the new serial_number column to photographers table
ALTER TABLE photographers 
ADD COLUMN serial_number TEXT;

-- Rename equipment column to camera_body
ALTER TABLE photographers 
RENAME COLUMN equipment TO camera_body;

-- Update status values from 'active'/'onleave' to 'staff'/'stringers'
UPDATE photographers 
SET status = CASE 
  WHEN status = 'active' THEN 'staff'
  WHEN status = 'onleave' THEN 'stringers'
  ELSE status
END;

-- Update the default value for new records
ALTER TABLE photographers 
ALTER COLUMN status SET DEFAULT 'staff';

-- Add new check constraint with the updated values
ALTER TABLE photographers 
ADD CONSTRAINT photographers_status_check 
CHECK (status IN ('staff', 'stringers'));
