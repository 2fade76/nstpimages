-- Add ownership column to camera_sets table
ALTER TABLE camera_sets 
ADD COLUMN ownership text NOT NULL DEFAULT 'own' CHECK (ownership IN ('loan', 'own'));