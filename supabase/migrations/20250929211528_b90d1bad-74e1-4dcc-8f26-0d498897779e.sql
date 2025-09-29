-- Drop the existing SECURITY DEFINER view
DROP VIEW IF EXISTS public.admission_applications_secure;

-- Create a regular view without SECURITY DEFINER
-- This view will respect the current user's permissions and RLS policies
CREATE VIEW public.admission_applications_secure AS
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
LEFT JOIN admission_sensitive_data asd ON aa.id = asd.application_id
WHERE is_admin();

-- Enable RLS on the view (though views inherit RLS from underlying tables)
ALTER VIEW public.admission_applications_secure SET (security_barrier = true);

-- Add a comment explaining the security approach
COMMENT ON VIEW public.admission_applications_secure IS 
'Secure view for admission applications that shows decrypted data only to admins. Uses regular view (not SECURITY DEFINER) to respect current user permissions and RLS policies.';