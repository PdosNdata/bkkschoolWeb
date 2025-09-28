-- Drop the existing view first
DROP VIEW IF EXISTS public.admission_applications_secure;

-- Recreate the view as a regular view (not SECURITY DEFINER) that includes access control logic
CREATE VIEW public.admission_applications_secure AS
SELECT 
    aa.id,
    aa.created_at,
    aa.updated_at,
    aa.birth_date,
    aa.special_needs,
    -- Only show sensitive data to admins, others see restricted message
    CASE 
        WHEN is_admin() THEN public.decrypt_sensitive_field(asd.encrypted_student_name)
        ELSE '[RESTRICTED]'
    END as student_name,
    CASE 
        WHEN is_admin() THEN public.decrypt_sensitive_field(asd.encrypted_parent_name)
        ELSE '[RESTRICTED]'
    END as parent_name,
    CASE 
        WHEN is_admin() THEN public.decrypt_sensitive_field(asd.encrypted_parent_phone)
        ELSE '[RESTRICTED]'
    END as parent_phone,
    CASE 
        WHEN is_admin() THEN public.decrypt_sensitive_field(asd.encrypted_parent_email)
        ELSE '[RESTRICTED]'
    END as parent_email,
    CASE 
        WHEN is_admin() THEN public.decrypt_sensitive_field(asd.encrypted_address)
        ELSE '[RESTRICTED]'
    END as address,
    aa.student_id,
    aa.grade,
    aa.previous_school,
    aa.gpa
FROM public.admission_applications aa
LEFT JOIN public.admission_sensitive_data asd ON aa.id = asd.application_id
-- Only return rows if user is admin
WHERE is_admin();