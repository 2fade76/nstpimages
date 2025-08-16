-- Remove the insecure "Anyone can read photographers" policy
DROP POLICY IF EXISTS "Anyone can read photographers" ON public.photographers;

-- Add secure policy that requires authentication for reading photographers
CREATE POLICY "Authenticated users can read photographers"
ON public.photographers
FOR SELECT
TO authenticated
USING (true);

-- Also remove the overly permissive update policy and replace with role-based access
DROP POLICY IF EXISTS "Anyone can update photographers" ON public.photographers;

-- Add role-based policies for updates - only admins and editors can modify photographers
CREATE POLICY "Admins and editors can update photographers"
ON public.photographers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- Add role-based policy for deleting photographers - only admins and editors
CREATE POLICY "Admins and editors can delete photographers"
ON public.photographers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));