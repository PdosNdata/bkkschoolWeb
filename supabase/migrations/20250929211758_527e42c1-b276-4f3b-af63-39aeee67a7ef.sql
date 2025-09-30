-- First, let's completely drop and recreate the view with explicit non-security-definer approach
DROP VIEW IF EXISTS public.admission_applications_secure CASCADE;

-- Instead of using a view, let's create a security definer function that properly handles access
-- This is the recommended approach for handling sensitive data access
CREATE OR REPLACE FUNCTION public.get_admission_applications_secure()
RETURNS TABLE (
    id uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    birth_date date,
    special_needs text,
    student_name text,
    parent_name text,
    parent_phone text,
    parent_email text,
    address text,
    student_id text,
    grade text,
    previous_school text,
    gpa text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow admins to access this function
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    RETURN QUERY
    SELECT 
        aa.id,
        aa.created_at,
        aa.updated_at,
        aa.birth_date,
        aa.special_needs,
        CASE
            WHEN is_admin() THEN decrypt_sensitive_field(asd.encrypted_student_name)
            ELSE '[RESTRICTED]'::text
        END AS student_name,
        CASE
            WHEN is_admin() THEN decrypt_sensitive_field(asd.encrypted_parent_name)
            ELSE '[RESTRICTED]'::text
        END AS parent_name,
        CASE
            WHEN is_admin() THEN decrypt_sensitive_field(asd.encrypted_parent_phone)
            ELSE '[RESTRICTED]'::text
        END AS parent_phone,
        CASE
            WHEN is_admin() THEN decrypt_sensitive_field(asd.encrypted_parent_email)
            ELSE '[RESTRICTED]'::text
        END AS parent_email,
        CASE
            WHEN is_admin() THEN decrypt_sensitive_field(asd.encrypted_address)
            ELSE '[RESTRICTED]'::text
        END AS address,
        aa.student_id,
        aa.grade,
        aa.previous_school,
        aa.gpa
    FROM admission_applications aa
    LEFT JOIN admission_sensitive_data asd ON aa.id = asd.application_id;
END;
$$;

-- Grant execute permission to authenticated users (function will handle admin check internally)
GRANT EXECUTE ON FUNCTION public.get_admission_applications_secure() TO authenticated;

-- Add a comment explaining the security approach
COMMENT ON FUNCTION public.get_admission_applications_secure() IS 
'Secure function for retrieving admission applications with decrypted data. Only accessible to admins. Replaces potentially problematic SECURITY DEFINER view.';