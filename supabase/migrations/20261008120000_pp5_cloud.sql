-- ปพ.5 ออนไลน์: เก็บข้อมูลรายวิชาทั้งหมดในฐานข้อมูล เพื่อใช้ข้ามเครื่องและหลายครู
-- (ตารางข้อมูลส่วนบุคคลนักเรียน student_personal อยู่ในไฟล์ 20261008090000 — ไม่เกี่ยวกับไฟล์นี้)
--
-- pp5_courses  : 1 แถว = 1 รายวิชา (รายชื่อ คะแนน เวลาเรียน คุณลักษณะ ตัวชี้วัด กิจกรรม ฯลฯ เก็บเป็น JSON ก้อนเดียว)
--                เจ้าของ = ครูที่สร้าง เห็น/แก้ได้เฉพาะของตัวเอง; แอดมินเห็น/แก้ได้ทุกวิชา
--                rev = เลขรุ่น เพิ่มทีละ 1 ทุกครั้งที่แก้ — ถ้าเปิดสองเครื่องแล้วแก้พร้อมกัน ฝั่งที่บันทึกทีหลังจะถูกปฏิเสธ
--                ไม่ทับกันเงียบ ๆ · ลบวิชา = ตั้ง deleted_at (กู้คืนได้) ไม่ลบแถวจริง
-- pp5_settings : แถวเดียว (id = 'main') ข้อมูลพื้นฐานโรงเรียน ใช้ร่วมกันทุกครู
--                ทุกบัญชีเจ้าหน้าที่อ่านได้; แก้ได้เฉพาะแอดมินหรือผู้มีสิทธิ์เมนู "ปพ.5 ออนไลน์" (pp5_system)
--
-- ไม่มีข้อมูลส่วนบุคคลละเอียดอ่อน (เลขบัตร ข้อมูลบิดามารดา) ในตารางเหล่านี้ — อยู่ใน student_personal

CREATE TABLE IF NOT EXISTS public.pp5_courses (
  id uuid PRIMARY KEY,                                  -- สร้างจากฝั่งแอป
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_email text,
  title text NOT NULL DEFAULT '',                       -- "รหัส ชื่อวิชา" ไว้แสดงในรายการ
  class_level text,
  room text,
  term integer,
  year integer,
  data jsonb NOT NULL,
  rev integer NOT NULL DEFAULT 1 CHECK (rev >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS pp5_courses_owner_idx ON public.pp5_courses (user_id, deleted_at);

-- กันการเขียนทับกัน + กันย้ายเจ้าของ: การแก้ทุกครั้งต้องส่ง rev = รุ่นเดิม + 1
CREATE OR REPLACE FUNCTION public.pp5_courses_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'cannot change owner' USING ERRCODE = '42501';
  END IF;
  IF NEW.rev <> OLD.rev + 1 THEN
    RAISE EXCEPTION 'rev conflict (expected %, got %)', OLD.rev + 1, NEW.rev USING ERRCODE = '40001';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pp5_courses_guard_trg ON public.pp5_courses;
CREATE TRIGGER pp5_courses_guard_trg
  BEFORE UPDATE ON public.pp5_courses
  FOR EACH ROW EXECUTE FUNCTION public.pp5_courses_guard();

ALTER TABLE public.pp5_courses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pp5_courses FROM anon;
REVOKE ALL ON public.pp5_courses FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pp5_courses TO authenticated;

DROP POLICY IF EXISTS "Owner or admin reads pp5 courses" ON public.pp5_courses;
CREATE POLICY "Owner or admin reads pp5 courses"
  ON public.pp5_courses FOR SELECT
  USING (public.can_access_dashboard() AND (user_id = auth.uid() OR public.is_admin()));

DROP POLICY IF EXISTS "Staff adds own pp5 courses" ON public.pp5_courses;
CREATE POLICY "Staff adds own pp5 courses"
  ON public.pp5_courses FOR INSERT
  WITH CHECK (public.can_access_dashboard() AND user_id = auth.uid());

DROP POLICY IF EXISTS "Owner or admin updates pp5 courses" ON public.pp5_courses;
CREATE POLICY "Owner or admin updates pp5 courses"
  ON public.pp5_courses FOR UPDATE
  USING (public.can_access_dashboard() AND (user_id = auth.uid() OR public.is_admin()))
  WITH CHECK (public.can_access_dashboard() AND (user_id = auth.uid() OR public.is_admin()));

DROP POLICY IF EXISTS "Admin deletes pp5 courses" ON public.pp5_courses;
CREATE POLICY "Admin deletes pp5 courses"
  ON public.pp5_courses FOR DELETE
  USING (public.is_admin());

/* ───────── ข้อมูลพื้นฐานโรงเรียน (ใช้ร่วมกัน) ───────── */
CREATE TABLE IF NOT EXISTS public.pp5_settings (
  id text PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
  data jsonb NOT NULL,
  updated_by uuid DEFAULT auth.uid(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.pp5_settings_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pp5_settings_touch_trg ON public.pp5_settings;
CREATE TRIGGER pp5_settings_touch_trg
  BEFORE UPDATE ON public.pp5_settings
  FOR EACH ROW EXECUTE FUNCTION public.pp5_settings_touch();

ALTER TABLE public.pp5_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pp5_settings FROM anon;
REVOKE ALL ON public.pp5_settings FROM public;
GRANT SELECT, INSERT, UPDATE ON public.pp5_settings TO authenticated;

DROP POLICY IF EXISTS "Staff reads pp5 settings" ON public.pp5_settings;
CREATE POLICY "Staff reads pp5 settings"
  ON public.pp5_settings FOR SELECT
  USING (public.can_access_dashboard());

DROP POLICY IF EXISTS "Approved adds pp5 settings" ON public.pp5_settings;
CREATE POLICY "Approved adds pp5 settings"
  ON public.pp5_settings FOR INSERT
  WITH CHECK (public.can_access_dashboard() AND public.has_menu_permission('pp5_system'));

DROP POLICY IF EXISTS "Approved updates pp5 settings" ON public.pp5_settings;
CREATE POLICY "Approved updates pp5 settings"
  ON public.pp5_settings FOR UPDATE
  USING (public.can_access_dashboard() AND public.has_menu_permission('pp5_system'))
  WITH CHECK (public.can_access_dashboard() AND public.has_menu_permission('pp5_system'));
