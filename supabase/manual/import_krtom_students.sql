-- One-time import: copy the krtom-classroom roster (public.krtom_students)
-- into the shared student registry (public.students).
--
-- Run in the Supabase SQL Editor, in TWO steps (select only the part you want to
-- run, or run each block separately):
--   STEP 1  = dry run. Prints counts only (no names). Check that the numbers look right.
--   STEP 2  = the actual import. Safe to re-run: rows whose student_code is already in
--             public.students are left untouched (nothing is overwritten).
--
-- krtom_students has: id, grade_id, grade_label ('ม.1'..'ป.6'), seat_no, student_code,
-- full_name, created_at. The registry needs first/last name and a prefix, so full_name is
-- split: a leading prefix (เด็กชาย / เด็กหญิง / นาย / นางสาว / นาง / ด.ช. / ด.ญ. ...), then the
-- first word is the first name and the rest is the last name. Gender is derived from the
-- prefix. The room is left empty (krtom has no room, and seat_no is the roll number).

-- ======================================================================
-- STEP 1 — dry run (counts only)
-- ======================================================================
with parsed as (
  select
    k.student_code,
    k.grade_label,
    substring(trim(regexp_replace(k.full_name, '\s+', ' ', 'g'))
              from '^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|ดช\.|ดญ\.|นางสาว|น\.ส\.|นาง|นาย)') as prefix,
    trim(regexp_replace(k.full_name, '\s+', ' ', 'g')) as fn
  from public.krtom_students k
), split as (
  select student_code, grade_label, prefix,
         trim(substr(fn, coalesce(length(prefix), 0) + 1)) as rest
  from parsed
)
select
  count(*)                                                        as total_in_krtom,
  count(*) filter (where prefix is null)                          as without_prefix,
  count(*) filter (where split_part(rest, ' ', 1) = '')           as empty_first_name,
  count(*) filter (where rest !~ ' ')                             as single_word_name_no_last_name,
  count(*) filter (where grade_label !~ '^[ปม]\.[1-6]$')          as unrecognised_class,
  count(*) filter (where s.student_code is not null)              as already_in_registry
from split
left join public.students s on s.student_code = split.student_code;

-- ======================================================================
-- STEP 2 — import (run after STEP 1 looks right)
-- ======================================================================
with parsed as (
  select
    k.student_code,
    k.grade_label,
    substring(trim(regexp_replace(k.full_name, '\s+', ' ', 'g'))
              from '^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|ดช\.|ดญ\.|นางสาว|น\.ส\.|นาง|นาย)') as prefix,
    trim(regexp_replace(k.full_name, '\s+', ' ', 'g')) as fn
  from public.krtom_students k
  where k.student_code is not null and trim(k.student_code) <> ''
), split as (
  select student_code, grade_label, prefix,
         trim(substr(fn, coalesce(length(prefix), 0) + 1)) as rest
  from parsed
)
insert into public.students (student_code, prefix, first_name, last_name, gender, class_level, room, is_active)
select
  trim(student_code),
  prefix,
  split_part(rest, ' ', 1),
  trim(substr(rest, length(split_part(rest, ' ', 1)) + 1)),
  case
    when prefix in ('เด็กชาย', 'นาย', 'ด.ช.', 'ดช.') then 'ช'
    when prefix in ('เด็กหญิง', 'นางสาว', 'นาง', 'ด.ญ.', 'ดญ.', 'น.ส.') then 'ญ'
  end,
  grade_label,
  null,
  true
from split
where split_part(rest, ' ', 1) <> ''
  and grade_label ~ '^[ปม]\.[1-6]$'
on conflict (student_code) do nothing;

-- Check the result: students per class in the registry (should add up to the krtom counts
-- plus anything that was already there).
select class_level, count(*) as n
from public.students
group by 1
order by 1;
