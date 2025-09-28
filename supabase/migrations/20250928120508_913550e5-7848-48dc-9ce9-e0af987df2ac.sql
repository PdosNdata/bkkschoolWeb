-- Fix function search path issues for existing functions
-- Update decrypt_sensitive_field function
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_field(encrypted_data text, secret_key text DEFAULT 'admission-app-secret-2024'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF encrypted_data IS NULL OR TRIM(encrypted_data) = '' THEN
    RETURN NULL;
  END IF;
  RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), secret_key, 'aes'), 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    RETURN '[DECRYPTION_ERROR]';
END;
$function$;

-- Update encrypt_sensitive_field function  
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(data text, secret_key text DEFAULT 'admission-app-secret-2024'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF data IS NULL OR TRIM(data) = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(encrypt(data::bytea, secret_key, 'aes'), 'base64');
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''), null)
  on conflict (id) do nothing;
  return new;
end;
$function$;

-- Update handle_admission_application_insert function
CREATE OR REPLACE FUNCTION public.handle_admission_application_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;