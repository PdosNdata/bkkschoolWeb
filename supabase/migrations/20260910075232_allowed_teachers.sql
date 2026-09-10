-- Pre-approved teacher list. Admins import emails here (e.g. from a Google
-- Form response sheet). When someone signs up with a listed email they get
-- an approved 'teacher' role automatically; teachers who already registered
-- are approved by the import screen.

CREATE TABLE IF NOT EXISTS public.allowed_teachers (
  email text PRIMARY KEY,
  full_name text,
  note text,
  added_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.allowed_teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can read the allowed teacher list" ON public.allowed_teachers;
CREATE POLICY "Staff can read the allowed teacher list"
  ON public.allowed_teachers FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'teacher') AND approved = true
  ));

DROP POLICY IF EXISTS "Admins manage the allowed teacher list" ON public.allowed_teachers;
CREATE POLICY "Admins manage the allowed teacher list"
  ON public.allowed_teachers FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Extend the signup trigger: a listed email becomes an approved teacher.
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

  if new.email is not null
     and exists (
       select 1 from public.allowed_teachers
       where lower(email) = lower(new.email)
     )
  then
    insert into public.user_roles (user_id, role, email, approved, pending_approval)
    values (new.id, 'teacher', new.email, true, false)
    on conflict (user_id) do update
      set role = 'teacher', approved = true, pending_approval = false, email = excluded.email;
  end if;

  return new;
end;
$function$;
