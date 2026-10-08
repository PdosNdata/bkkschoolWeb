-- ข้อมูลส่วนบุคคลนักเรียน: เพิ่มฟิลด์ให้ครบตามไฟล์ส่งออกมาตรฐาน "studentInSchoolList.xlsx" (91 คอลัมน์)
-- เพื่อให้อัปโหลดไฟล์นั้นที่หน้า "ข้อมูลนักเรียน" ได้โดยตรง
--
-- แบ่งการเก็บ:
--   • รหัสนักเรียน ชื่อ เพศ ชั้น ห้อง  → ตาราง students (ทะเบียนนักเรียน — ทุกบัญชีเจ้าหน้าที่ดูได้)
--   • ข้อมูลที่เหลือทั้งหมด              → ตาราง student_personal (จำกัดสิทธิ์ ดูด้านล่าง)
-- ต้องรัน 20261008090000_student_personal.sql มาก่อน
--
-- สิทธิ์ของ student_personal (ข้อมูลอ่อนไหวตาม PDPA: เลขบัตรประชาชน รายได้ เบอร์โทร ที่อยู่ ความพิการ ความด้อยโอกาส):
--   อ่าน/เพิ่ม/แก้ : แอดมิน หรือผู้ได้รับอนุมัติเมนู "ปพ.5 ออนไลน์" (pp5_system) หรือ "ข้อมูลนักเรียน" (students_system)
--   ลบแถว          : เฉพาะแอดมิน
--   anon           : เข้าไม่ได้
-- (เพิ่ม students_system เพราะผู้ที่อัปโหลดไฟล์ทะเบียนนักเรียนต้องเขียนข้อมูลชุดนี้ได้)
--
-- ค่าตัวเลขเก็บเป็นข้อความตามที่อยู่ในไฟล์ (เช่น น้ำหนัก ส่วนสูง GPA) เพื่อไม่ให้การนำเข้าล้มเมื่อมีค่าอย่าง "-" หรือ "ไม่มี"
-- คอลัมน์ชื่อซ้ำท้ายไฟล์ (จำนวนพี่ชาย/น้องชาย/น้องสาว ซ้ำอีกชุด) ใช้ค่าจากคอลัมน์ชุดแรกเท่านั้น

ALTER TABLE public.student_personal
  ADD COLUMN IF NOT EXISTS school_code text,
  ADD COLUMN IF NOT EXISTS school_name text,
  ADD COLUMN IF NOT EXISTS first_name_en text,
  ADD COLUMN IF NOT EXISTS last_name_en text,
  ADD COLUMN IF NOT EXISTS age_years text,
  ADD COLUMN IF NOT EXISTS age_months text,
  ADD COLUMN IF NOT EXISTS siblings_older_brothers text,
  ADD COLUMN IF NOT EXISTS siblings_younger_brothers text,
  ADD COLUMN IF NOT EXISTS siblings_older_sisters text,
  ADD COLUMN IF NOT EXISTS siblings_younger_sisters text,
  ADD COLUMN IF NOT EXISTS child_order text,
  ADD COLUMN IF NOT EXISTS father_national_id text,
  ADD COLUMN IF NOT EXISTS father_prefix text,
  ADD COLUMN IF NOT EXISTS father_first_name text,
  ADD COLUMN IF NOT EXISTS father_last_name text,
  ADD COLUMN IF NOT EXISTS father_income text,
  ADD COLUMN IF NOT EXISTS father_phone text,
  ADD COLUMN IF NOT EXISTS mother_national_id text,
  ADD COLUMN IF NOT EXISTS mother_prefix text,
  ADD COLUMN IF NOT EXISTS mother_first_name text,
  ADD COLUMN IF NOT EXISTS mother_last_name text,
  ADD COLUMN IF NOT EXISTS mother_income text,
  ADD COLUMN IF NOT EXISTS mother_phone text,
  ADD COLUMN IF NOT EXISTS guardian_national_id text,
  ADD COLUMN IF NOT EXISTS guardian_prefix text,
  ADD COLUMN IF NOT EXISTS guardian_first_name text,
  ADD COLUMN IF NOT EXISTS guardian_last_name text,
  ADD COLUMN IF NOT EXISTS guardian_income text,
  ADD COLUMN IF NOT EXISTS guardian_phone text,
  ADD COLUMN IF NOT EXISTS reg_house_code text,
  ADD COLUMN IF NOT EXISTS reg_house_no text,
  ADD COLUMN IF NOT EXISTS reg_moo text,
  ADD COLUMN IF NOT EXISTS reg_road text,
  ADD COLUMN IF NOT EXISTS reg_subdistrict text,
  ADD COLUMN IF NOT EXISTS reg_district text,
  ADD COLUMN IF NOT EXISTS reg_province text,
  ADD COLUMN IF NOT EXISTS reg_postcode text,
  ADD COLUMN IF NOT EXISTS reg_phone text,
  ADD COLUMN IF NOT EXISTS cur_house_code text,
  ADD COLUMN IF NOT EXISTS cur_house_no text,
  ADD COLUMN IF NOT EXISTS cur_moo text,
  ADD COLUMN IF NOT EXISTS cur_road text,
  ADD COLUMN IF NOT EXISTS cur_subdistrict text,
  ADD COLUMN IF NOT EXISTS cur_district text,
  ADD COLUMN IF NOT EXISTS cur_province text,
  ADD COLUMN IF NOT EXISTS cur_postcode text,
  ADD COLUMN IF NOT EXISTS cur_phone text,
  ADD COLUMN IF NOT EXISTS weight text,
  ADD COLUMN IF NOT EXISTS height text,
  ADD COLUMN IF NOT EXISTS disadvantaged text,
  ADD COLUMN IF NOT EXISTS boarding text,
  ADD COLUMN IF NOT EXISTS lack_uniform text,
  ADD COLUMN IF NOT EXISTS lack_stationery text,
  ADD COLUMN IF NOT EXISTS lack_textbooks text,
  ADD COLUMN IF NOT EXISTS lack_lunch text,
  ADD COLUMN IF NOT EXISTS disability text,
  ADD COLUMN IF NOT EXISTS dist_unpaved text,
  ADD COLUMN IF NOT EXISTS dist_paved text,
  ADD COLUMN IF NOT EXISTS dist_water text,
  ADD COLUMN IF NOT EXISTS travel_duration text,
  ADD COLUMN IF NOT EXISTS travel_mode text,
  ADD COLUMN IF NOT EXISTS student_type text,
  ADD COLUMN IF NOT EXISTS gpa text,
  ADD COLUMN IF NOT EXISTS gpax text,
  ADD COLUMN IF NOT EXISTS birth_province text,
  ADD COLUMN IF NOT EXISTS child_order_alt text,
  ADD COLUMN IF NOT EXISTS siblings_studying text,
  ADD COLUMN IF NOT EXISTS branch_school_code text,
  ADD COLUMN IF NOT EXISTS branch_school_name text;

-- สิทธิ์: เพิ่มผู้ที่ได้รับอนุมัติเมนู "ข้อมูลนักเรียน" (students_system) ให้อ่าน/เพิ่ม/แก้ได้ด้วย (ลบแถว = แอดมินเท่านั้นเหมือนเดิม)
DROP POLICY IF EXISTS "Approved can read student_personal" ON public.student_personal;
CREATE POLICY "Approved can read student_personal"
  ON public.student_personal FOR SELECT
  USING (public.can_access_dashboard() AND (public.has_menu_permission('pp5_system') OR public.has_menu_permission('students_system')));

DROP POLICY IF EXISTS "Approved can add student_personal" ON public.student_personal;
CREATE POLICY "Approved can add student_personal"
  ON public.student_personal FOR INSERT
  WITH CHECK (public.can_access_dashboard() AND (public.has_menu_permission('pp5_system') OR public.has_menu_permission('students_system')));

DROP POLICY IF EXISTS "Approved can update student_personal" ON public.student_personal;
CREATE POLICY "Approved can update student_personal"
  ON public.student_personal FOR UPDATE
  USING (public.can_access_dashboard() AND (public.has_menu_permission('pp5_system') OR public.has_menu_permission('students_system')))
  WITH CHECK (public.can_access_dashboard() AND (public.has_menu_permission('pp5_system') OR public.has_menu_permission('students_system')));

-- ให้ PostgREST (API ของ Supabase) รู้จักคอลัมน์ใหม่ทันที ไม่ต้องรอรีเฟรชเอง
NOTIFY pgrst, 'reload schema';
