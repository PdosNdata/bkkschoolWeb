-- Add approval status to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN pending_approval BOOLEAN NOT NULL DEFAULT true;