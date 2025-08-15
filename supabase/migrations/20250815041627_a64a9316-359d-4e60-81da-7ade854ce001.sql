-- Drop the dangerous policy that allows users to update their own roles
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;

-- Drop the policy that allows users to insert their own roles without validation
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

-- Create admin-only policies for role management
CREATE POLICY "Only admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Allow users to insert their initial role as 'student' only (for new user registration)
CREATE POLICY "New users can set initial student role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'student' 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()
  )
);