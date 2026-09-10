-- Pre-approved teacher list. Admins import emails here (e.g. from a Google
-- Form response sheet). On import every listed email gets an APPROVED
-- 'teacher' row in user_roles right away:
--   * already-registered accounts are updated in place
--   * not-yet-registered emails get a placeholder row that the signup
--     trigger "claims" (swaps in the real user_id) when the teacher joins.

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

-- Signup trigger: claim a placeholder row for this email if one exists,
-- otherwise create an approved teacher row when the email is on the list.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
declare
  claimed integer;
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''), null)
  on conflict (id) do nothing;

  if new.email is null then
    return new;
  end if;

  -- Claim an unclaimed placeholder row (user_id points at no real account)
  update public.user_roles ur
    set user_id = new.id, role = 'teacher', approved = true, pending_approval = false
    where lower(ur.email) = lower(new.email)
      and ur.role <> 'admin'
      and not exists (select 1 from auth.users au where au.id = ur.user_id);
  get diagnostics claimed = row_count;

  if claimed = 0
     and exists (select 1 from public.allowed_teachers where lower(email) = lower(new.email))
  then
    insert into public.user_roles (user_id, role, email, approved, pending_approval)
    values (new.id, 'teacher', new.email, true, false)
    on conflict (user_id) do update
      set role = 'teacher', approved = true, pending_approval = false, email = excluded.email;
  end if;

  return new;
end;
$function$;

-- Approve every already-registered account whose auth email is on the list.
CREATE OR REPLACE FUNCTION public.approve_teachers_by_email(emails text[])
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
declare
  n integer;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  with lowered as (
    select distinct lower(trim(e)) as e from unnest(emails) as e
  ),
  upd as (
    update public.user_roles ur
      set role = 'teacher', approved = true, pending_approval = false,
          email = coalesce(ur.email, au.email)
      from auth.users au
      where ur.user_id = au.id
        and ur.role <> 'admin'
        and lower(au.email) in (select e from lowered)
      returning ur.user_id
  )
  select count(*) into n from upd;

  return n;
end;
$function$;

-- Give every allowed_teachers email an approved teacher row now. For emails
-- that have not registered yet, insert a placeholder row (random user_id)
-- that the signup trigger will later claim.
CREATE OR REPLACE FUNCTION public.provision_allowed_teachers()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
declare
  n integer;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  -- 1) approve rows that already exist for these emails (registered or placeholder)
  update public.user_roles ur
    set role = 'teacher', approved = true, pending_approval = false
    where ur.role <> 'admin'
      and lower(coalesce(ur.email,
          (select au.email from auth.users au where au.id = ur.user_id))) in (
      select lower(email) from public.allowed_teachers
    );

  -- 2) create placeholder rows for emails with no row at all
  with missing as (
    select at.email
    from public.allowed_teachers at
    where not exists (
      select 1 from public.user_roles ur
      where lower(coalesce(ur.email,
            (select au.email from auth.users au where au.id = ur.user_id))) = lower(at.email)
    )
  ),
  ins as (
    insert into public.user_roles (user_id, role, email, approved, pending_approval)
    select gen_random_uuid(), 'teacher', email, true, false from missing
    returning 1
  )
  select count(*) into n from ins;

  return n;
end;
$function$;

-- Remove an email from the list and drop its unclaimed placeholder row
-- (a real, logged-in teacher keeps their access).
CREATE OR REPLACE FUNCTION public.remove_allowed_teacher(p_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  delete from public.allowed_teachers where lower(email) = lower(p_email);

  delete from public.user_roles ur
    where lower(ur.email) = lower(p_email)
      and not exists (select 1 from auth.users au where au.id = ur.user_id);
end;
$function$;
