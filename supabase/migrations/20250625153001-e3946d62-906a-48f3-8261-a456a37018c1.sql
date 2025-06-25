
-- Enable realtime for the assignments table
ALTER TABLE public.assignments REPLICA IDENTITY FULL;

-- Add the assignments table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;

-- Also enable realtime for photographers table if not already enabled
ALTER TABLE public.photographers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photographers;
