-- Create a separate table for highly sensitive personal information
CREATE TABLE public.admission_sensitive_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES public.admission_applications(id) ON DELETE CASCADE,
  encrypted_student_name text,
  encrypted_parent_name text,
  encrypted_parent_phone text,
  encrypted_parent_email text,
  encrypted_address text,
  encrypted_birth_date text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(application_id)
);

-- Enable RLS on the sensitive data table
ALTER TABLE public.admission_sensitive_data ENABLE ROW LEVEL SECURITY;

-- Create super restrictive policies for sensitive data
CREATE POLICY "Only super admins can access sensitive data" 
ON public.admission_sensitive_data 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
      AND ur.approved = true
      AND ur.created_at < (now() - INTERVAL '30 days') -- Admin must be established for 30+ days
  )
);

-- Create function to encrypt sensitive data (using built-in pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function to safely encrypt data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(data text, secret_key text DEFAULT 'admission-app-secret-2024')
RETURNS text AS $$
BEGIN
  IF data IS NULL OR TRIM(data) = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(encrypt(data::bytea, secret_key, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to safely decrypt data
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_field(encrypted_data text, secret_key text DEFAULT 'admission-app-secret-2024')
RETURNS text AS $$
BEGIN
  IF encrypted_data IS NULL OR TRIM(encrypted_data) = '' THEN
    RETURN NULL;
  END IF;
  RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), secret_key, 'aes'), 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    RETURN '[DECRYPTION_ERROR]';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create secure view for admission applications with decrypted data (admin only)
CREATE OR REPLACE VIEW public.admission_applications_secure AS
SELECT 
  a.id,
  a.student_id,
  a.grade,
  a.previous_school,
  a.gpa,
  a.special_needs,
  a.created_at,
  a.updated_at,
  -- Decrypt sensitive fields only for authorized access
  CASE 
    WHEN is_admin() THEN public.decrypt_sensitive_field(s.encrypted_student_name)
    ELSE '[REDACTED]'
  END AS student_name,
  CASE 
    WHEN is_admin() THEN public.decrypt_sensitive_field(s.encrypted_parent_name)
    ELSE '[REDACTED]'
  END AS parent_name,
  CASE 
    WHEN is_admin() THEN public.decrypt_sensitive_field(s.encrypted_parent_phone)
    ELSE '[REDACTED]'
  END AS parent_phone,
  CASE 
    WHEN is_admin() THEN public.decrypt_sensitive_field(s.encrypted_parent_email)
    ELSE '[REDACTED]'
  END AS parent_email,
  CASE 
    WHEN is_admin() THEN public.decrypt_sensitive_field(s.encrypted_address)
    ELSE '[REDACTED]'
  END AS address,
  CASE 
    WHEN is_admin() THEN public.decrypt_sensitive_field(s.encrypted_birth_date)::date
    ELSE NULL
  END AS birth_date
FROM public.admission_applications a
LEFT JOIN public.admission_sensitive_data s ON a.id = s.application_id;

-- Update the existing get_admission_applications_for_admin function to use the secure view
CREATE OR REPLACE FUNCTION public.get_admission_applications_for_admin()
RETURNS TABLE(
  id uuid, 
  student_name text, 
  student_id text, 
  grade text, 
  parent_name text, 
  parent_phone text, 
  parent_email text, 
  address text, 
  previous_school text, 
  birth_date date, 
  gpa text, 
  special_needs text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  RETURN QUERY
  SELECT 
    v.id, v.student_name, v.student_id, v.grade,
    v.parent_name, v.parent_phone, v.parent_email,
    v.address, v.previous_school, v.birth_date,
    v.gpa, v.special_needs, v.created_at, v.updated_at
  FROM public.admission_applications_secure v
  ORDER BY v.created_at DESC;
END;
$$;

-- Create trigger to automatically encrypt and store sensitive data when new applications are inserted
CREATE OR REPLACE FUNCTION public.handle_admission_application_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert encrypted sensitive data into separate table
  INSERT INTO public.admission_sensitive_data (
    application_id,
    encrypted_student_name,
    encrypted_parent_name,
    encrypted_parent_phone,
    encrypted_parent_email,
    encrypted_address,
    encrypted_birth_date
  ) VALUES (
    NEW.id,
    public.encrypt_sensitive_field(NEW.student_name),
    public.encrypt_sensitive_field(NEW.parent_name),
    public.encrypt_sensitive_field(NEW.parent_phone),
    public.encrypt_sensitive_field(NEW.parent_email),
    public.encrypt_sensitive_field(NEW.address),
    public.encrypt_sensitive_field(NEW.birth_date::text)
  );
  
  -- Clear sensitive data from main table (keep only for backwards compatibility during transition)
  NEW.student_name := '[ENCRYPTED]';
  NEW.parent_name := '[ENCRYPTED]';
  NEW.parent_phone := '[ENCRYPTED]';
  NEW.parent_email := '[ENCRYPTED]';
  NEW.address := '[ENCRYPTED]';
  NEW.birth_date := '1900-01-01'::date; -- Placeholder date
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER encrypt_admission_sensitive_data
  BEFORE INSERT ON public.admission_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admission_application_insert();

-- Add additional security logging for sensitive data access
CREATE TABLE public.sensitive_data_access_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  application_id uuid,
  access_type text NOT NULL,
  ip_address inet,
  user_agent text,
  accessed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on access log
ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view access logs
CREATE POLICY "Only admins can view access logs" 
ON public.sensitive_data_access_log 
FOR SELECT
USING (is_admin());

-- Create function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(app_id uuid, access_type text)
RETURNS void AS $$
BEGIN
  INSERT INTO public.sensitive_data_access_log (
    user_id, application_id, access_type, ip_address
  ) VALUES (
    auth.uid(), app_id, access_type, inet_client_addr()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;