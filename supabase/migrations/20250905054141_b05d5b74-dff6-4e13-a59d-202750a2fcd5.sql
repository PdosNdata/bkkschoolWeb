-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update any user role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete any user role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;

-- Create a security definer function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND approved = true
  );
$$;

-- Create new policies using the security definer function
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can update any user role" 
ON public.user_roles 
FOR UPDATE 
USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can delete any user role" 
ON public.user_roles 
FOR DELETE 
USING (public.is_admin());

CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.is_admin() OR auth.uid() = user_id);