-- =====================================================
-- SECURITY FIX: Remove public access policies
-- =====================================================

-- ============ ASSIGNMENTS TABLE ============
-- Remove dangerous public access policies
DROP POLICY IF EXISTS "Anyone can read assignments" ON public.assignments;
DROP POLICY IF EXISTS "All users can view assignments" ON public.assignments;
DROP POLICY IF EXISTS "Anyone can update assignments" ON public.assignments;

-- Add secure authenticated user SELECT policy
CREATE POLICY "Authenticated users can view assignments"
ON public.assignments
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Keep existing secure policies:
-- ✓ "Admins and editors can insert assignments"
-- ✓ "Admins and editors can update assignments"
-- ✓ "Users can update assignment status only"
-- ✓ "Authenticated users can create assignments"

-- Add DELETE policy for admins/editors
CREATE POLICY "Admins and editors can delete assignments"
ON public.assignments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));


-- ============ PROFILES TABLE ============
-- Remove public access policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Add secure user-scoped SELECT policy
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Add admin access to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep existing secure policies:
-- ✓ "Users can insert their own profile"
-- ✓ "Users can update their own profile"


-- ============ CAMERA_SETS TABLE ============
-- Remove all public access policies
DROP POLICY IF EXISTS "Anyone can read camera sets" ON public.camera_sets;
DROP POLICY IF EXISTS "Anyone can update camera sets" ON public.camera_sets;
DROP POLICY IF EXISTS "Anyone can delete camera sets" ON public.camera_sets;
DROP POLICY IF EXISTS "Authenticated users can create camera sets" ON public.camera_sets;

-- Add secure authenticated user SELECT policy
CREATE POLICY "Authenticated users can view camera sets"
ON public.camera_sets
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Add role-based management policies for admins and editors
CREATE POLICY "Admins and editors can insert camera sets"
ON public.camera_sets
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors can update camera sets"
ON public.camera_sets
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins and editors can delete camera sets"
ON public.camera_sets
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));