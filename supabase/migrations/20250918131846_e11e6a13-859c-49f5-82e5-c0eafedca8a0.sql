-- Fix function search path security warnings

-- Update log_admission_application_changes function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update check_submission_rate_limit function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update sanitize_admission_data function
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
$$ LANGUAGE plpgsql SET search_path = public;

-- Update get_admission_applications_for_admin function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;