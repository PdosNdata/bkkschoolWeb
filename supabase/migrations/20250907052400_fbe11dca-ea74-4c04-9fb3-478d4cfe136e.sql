-- Create user_permissions table for menu access control
CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permission_name TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission_name)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all permissions" 
ON public.user_permissions 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();