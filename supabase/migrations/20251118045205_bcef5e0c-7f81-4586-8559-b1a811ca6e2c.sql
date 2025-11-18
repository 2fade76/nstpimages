-- Drop the restrictive policy that only allows status updates
DROP POLICY IF EXISTS "Users can update assignment status only" ON assignments;

-- Create a new policy that allows authenticated users to update all assignment fields
CREATE POLICY "Authenticated users can update assignments"
ON assignments
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);