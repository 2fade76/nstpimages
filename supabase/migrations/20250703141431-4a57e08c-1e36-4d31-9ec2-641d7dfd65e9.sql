
-- Create the camera_sets table
CREATE TABLE public.camera_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photographer_id UUID NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
  camera_body_model TEXT,
  camera_body_serial TEXT,
  lens_16_35_serial TEXT,
  lens_70_200_serial TEXT,
  battery_grip_serial TEXT,
  flash_serial TEXT,
  adapter_serial TEXT,
  camera_year_make TEXT,
  lens_16_35_year_make TEXT,
  lens_70_200_year_make TEXT,
  battery_grip_year_make TEXT,
  flash_year_make TEXT,
  adapter_year_make TEXT,
  date_received DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.camera_sets ENABLE ROW LEVEL SECURITY;

-- Create policies for camera_sets
CREATE POLICY "Anyone can read camera sets" 
  ON public.camera_sets 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create camera sets" 
  ON public.camera_sets 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update camera sets" 
  ON public.camera_sets 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete camera sets" 
  ON public.camera_sets 
  FOR DELETE 
  USING (true);

-- Create an index for better performance when querying by photographer
CREATE INDEX idx_camera_sets_photographer_id ON public.camera_sets(photographer_id);
