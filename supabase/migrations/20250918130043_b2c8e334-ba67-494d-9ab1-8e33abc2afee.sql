-- Enhanced security for admission_applications table

-- Add data validation constraints
ALTER TABLE public.admission_applications 
ADD CONSTRAINT valid_email_format CHECK (parent_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT valid_phone_format CHECK (parent_phone ~ '^[0-9\-\+\(\)\s]{8,15}$'),
ADD CONSTRAINT valid_student_id_format CHECK (student_id ~ '^[A-Za-z0-9]{3,20}$'),
ADD CONSTRAINT valid_grade_format CHECK (grade ~ '^(ปฐมวัย|ป\.[1-6]|ม\.[1-6]|Grade [1-12])$'),
ADD CONSTRAINT reasonable_birth_date CHECK (birth_date >= '1900-01-01' AND birth_date <= CURRENT_DATE - INTERVAL '3 years'),
ADD CONSTRAINT non_empty_names CHECK (
  LENGTH(TRIM(student_name)) >= 2 AND 
  LENGTH(TRIM(parent_name)) >= 2
);

-- Create audit table for tracking application submissions
CREATE TABLE public.admission_applications_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  old_values JSONB,
  new_values JSONB
);

-- Enable RLS on audit table
ALTER TABLE public.admission_applications_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.admission_applications_audit 
FOR SELECT 
USING (is_admin());

-- Create function to log application changes
CREATE OR REPLACE FUNCTION public.log_admission_application_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admission_applications_audit (
      application_id, action, performed_at, new_values
    ) VALUES (
      NEW.id, 'INSERT', now(), row_to_json(NEW)::jsonb
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.admission_applications_audit (
      application_id, action, performed_at, old_values, new_values
    ) VALUES (
      NEW.id, 'UPDATE', now(), row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.admission_applications_audit (
      application_id, action, performed_at, old_values
    ) VALUES (
      OLD.id, 'DELETE', now(), row_to_json(OLD)::jsonb
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
CREATE TRIGGER admission_applications_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.admission_applications
  FOR EACH ROW EXECUTE FUNCTION public.log_admission_application_changes();

-- Add rate limiting table for submission tracking
CREATE TABLE public.submission_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  email TEXT NOT NULL,
  submission_count INTEGER DEFAULT 1,
  first_submission_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_submission_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_blocked BOOLEAN DEFAULT false,
  blocked_until TIMESTAMP WITH TIME ZONE,
  UNIQUE(ip_address, email)
);

-- Enable RLS on rate limit table
ALTER TABLE public.submission_rate_limit ENABLE ROW LEVEL SECURITY;

-- Only admins can view rate limit data
CREATE POLICY "Only admins can view rate limit data"
ON public.submission_rate_limit
FOR ALL
USING (is_admin());

-- Create function to check and enforce rate limits
CREATE OR REPLACE FUNCTION public.check_submission_rate_limit(
  p_ip_address INET,
  p_email TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  is_currently_blocked BOOLEAN;
  block_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if IP/email combination is currently blocked
  SELECT is_blocked, blocked_until INTO is_currently_blocked, block_until
  FROM public.submission_rate_limit
  WHERE ip_address = p_ip_address AND email = p_email;
  
  -- If blocked and block period hasn't expired, reject
  IF is_currently_blocked AND block_until > now() THEN
    RETURN FALSE;
  END IF;
  
  -- Reset block if expired
  IF is_currently_blocked AND block_until <= now() THEN
    UPDATE public.submission_rate_limit 
    SET is_blocked = false, blocked_until = NULL, submission_count = 0
    WHERE ip_address = p_ip_address AND email = p_email;
  END IF;
  
  -- Insert or update rate limit record
  INSERT INTO public.submission_rate_limit (ip_address, email, submission_count, first_submission_at, last_submission_at)
  VALUES (p_ip_address, p_email, 1, now(), now())
  ON CONFLICT (ip_address, email) 
  DO UPDATE SET 
    submission_count = submission_rate_limit.submission_count + 1,
    last_submission_at = now();
  
  -- Get current count
  SELECT submission_count INTO current_count
  FROM public.submission_rate_limit
  WHERE ip_address = p_ip_address AND email = p_email;
  
  -- Block if too many submissions (more than 3 per hour)
  IF current_count > 3 THEN
    UPDATE public.submission_rate_limit 
    SET is_blocked = true, blocked_until = now() + INTERVAL '1 hour'
    WHERE ip_address = p_ip_address AND email = p_email;
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add data sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_admission_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim whitespace and normalize data
  NEW.student_name := TRIM(NEW.student_name);
  NEW.parent_name := TRIM(NEW.parent_name);
  NEW.parent_email := LOWER(TRIM(NEW.parent_email));
  NEW.parent_phone := REGEXP_REPLACE(TRIM(NEW.parent_phone), '[^0-9\-\+\(\)\s]', '', 'g');
  NEW.address := TRIM(NEW.address);
  NEW.previous_school := TRIM(NEW.previous_school);
  
  -- Prevent malicious content
  IF NEW.student_name ~ '<|>|script|javascript|onload|onerror' OR
     NEW.parent_name ~ '<|>|script|javascript|onload|onerror' OR
     NEW.address ~ '<|>|script|javascript|onload|onerror' THEN
    RAISE EXCEPTION 'Invalid characters detected in application data';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data sanitization
CREATE TRIGGER sanitize_admission_data_trigger
  BEFORE INSERT OR UPDATE ON public.admission_applications
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_admission_data();

-- Update RLS policies with additional security
DROP POLICY IF EXISTS "Allow public insert on admission applications" ON public.admission_applications;

-- Create more restrictive insert policy with built-in validation
CREATE POLICY "Allow controlled public insert on admission applications"
ON public.admission_applications
FOR INSERT
WITH CHECK (
  -- Basic validation checks
  LENGTH(TRIM(student_name)) >= 2 AND
  LENGTH(TRIM(parent_name)) >= 2 AND
  parent_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  birth_date >= '1900-01-01' AND
  birth_date <= CURRENT_DATE - INTERVAL '3 years'
);

-- Create function for admins to safely view applications
CREATE OR REPLACE FUNCTION public.get_admission_applications_for_admin()
RETURNS TABLE (
  id UUID,
  student_name TEXT,
  student_id TEXT,
  grade TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  address TEXT,
  previous_school TEXT,
  birth_date DATE,
  gpa TEXT,
  special_needs TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  RETURN QUERY
  SELECT 
    a.id, a.student_name, a.student_id, a.grade,
    a.parent_name, a.parent_phone, a.parent_email,
    a.address, a.previous_school, a.birth_date,
    a.gpa, a.special_needs, a.created_at, a.updated_at
  FROM public.admission_applications a
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;