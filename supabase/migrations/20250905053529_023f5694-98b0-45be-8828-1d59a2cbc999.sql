-- Add email field to user_roles table
ALTER TABLE public.user_roles ADD COLUMN email TEXT;

-- Update RLS policies to allow admins to view all user roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin' 
    AND ur.approved = true
  )
);

-- Allow admins to update any user role
CREATE POLICY "Admins can update any user role" 
ON public.user_roles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin' 
    AND ur.approved = true
  )
);

-- Allow admins to delete any user role
CREATE POLICY "Admins can delete any user role" 
ON public.user_roles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin' 
    AND ur.approved = true
  )
);

-- Allow admins to insert user roles for others
CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin' 
    AND ur.approved = true
  )
  OR auth.uid() = user_id
);