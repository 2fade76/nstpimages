-- Fix security issue: Restrict photographers table access to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can read photographers" ON public.photographers;

CREATE POLICY "Authenticated users can read photographers"
ON public.photographers
FOR SELECT
USING (auth.uid() IS NOT NULL);