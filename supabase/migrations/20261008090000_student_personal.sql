-- ข้อมูลส่วนบุคคลของนักเรียนสำหรับพิมพ์ ปพ.5 / ปพ.6 (แอป "ปพ.5 ออนไลน์" ที่ /pp5/)
--
-- เก็บเฉพาะที่แบบ ปพ.5/ปพ.6 ต้องพิมพ์: ชื่อ-สกุล วันเกิด สัญชาติ เชื้อชาติ ศาสนา หมู่โลหิต
-- เลขประจำตัวประชาชนของนักเรียน และชื่อ-อาชีพของบิดา มารดา ผู้ปกครอง
-- จงใจ "ไม่เก็บ": รายได้ เบอร์โทร ที่อยู่/ทะเบียนบ้าน ความพิการ ความด้อยโอกาส เลขบัตรของบิดา/มารดา/ผู้ปกครอง
--
-- สิทธิ์ (ข้อมูลอ่อนไหวตาม PDPA — เข้มงวดกว่าตารางนักเรียนทั่วไป):
--   • อ่าน/เพิ่ม/แก้ไข : เฉพาะแอดมิน หรือบัญชีที่แอดมินอนุมัติเมนู "ปพ.5 ออนไลน์" (pp5_system) เท่านั้น
--   • ลบแถว           : เฉพาะแอดมิน
--   • ผู้ใช้ที่ยังไม่ล็อกอิน (anon) เข้าถึงไม่ได้เลย
-- แถวผูกกับนักเรียนด้วยรหัสนักเรียน (student_code) และใช้ร่วมกันทุกวิชา/ทุกครู ไม่ต้องกรอกซ้ำ

CREATE TABLE IF NOT EXISTS public.student_personal (
  student_code text PRIMARY KEY CHECK (length(btrim(student_code)) > 0),
  national_id text CHECK (national_id IS NULL OR national_id ~ '^[0-9]{13}$'),
  prefix text,
  first_name text,
  last_name text,
  birth_date text,            -- ตามที่ใช้ใน Excel เช่น 15/5/2556
  blood_type text,
  nationality text,
  ethnicity text,
  religion text,
  parents_status text,        -- สถานภาพสมรสของบิดามารดา
  father_name text,
  father_job text,
  mother_name text,
  mother_job text,
  guardian_relation text,
  guardian_name text,
  guardian_job text,
  class_level text,           -- ชั้น/ห้อง ตอนบันทึก (อ้างอิง ไม่ใช้บังคับสิทธิ์)
  room text,
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.student_personal IS
  'ข้อมูลส่วนบุคคลนักเรียนเพื่อพิมพ์ ปพ.5/ปพ.6 — ข้อมูลอ่อนไหว (PDPA): จำกัดสิทธิ์ด้วย RLS ต้องมีเมนู pp5_system หรือเป็นแอดมิน';

CREATE INDEX IF NOT EXISTS student_personal_class_idx ON public.student_personal (class_level, room);

-- บันทึกเวลา/ผู้แก้ไขล่าสุดทุกครั้งที่แก้
CREATE OR REPLACE FUNCTION public.student_personal_touch()
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

DROP TRIGGER IF EXISTS student_personal_touch_trg ON public.student_personal;
CREATE TRIGGER student_personal_touch_trg
  BEFORE UPDATE ON public.student_personal
  FOR EACH ROW EXECUTE FUNCTION public.student_personal_touch();

ALTER TABLE public.student_personal ENABLE ROW LEVEL SECURITY;

-- ไม่ให้ผู้ที่ยังไม่ล็อกอินแตะต้องตารางนี้ได้เลย (ชั้นที่สองนอกเหนือจาก RLS)
REVOKE ALL ON public.student_personal FROM anon;
REVOKE ALL ON public.student_personal FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_personal TO authenticated;

DROP POLICY IF EXISTS "Approved can read student_personal" ON public.student_personal;
CREATE POLICY "Approved can read student_personal"
  ON public.student_personal FOR SELECT
  USING (public.can_access_dashboard() AND public.has_menu_permission('pp5_system'));

DROP POLICY IF EXISTS "Approved can add student_personal" ON public.student_personal;
CREATE POLICY "Approved can add student_personal"
  ON public.student_personal FOR INSERT
  WITH CHECK (public.can_access_dashboard() AND public.has_menu_permission('pp5_system'));

DROP POLICY IF EXISTS "Approved can update student_personal" ON public.student_personal;
CREATE POLICY "Approved can update student_personal"
  ON public.student_personal FOR UPDATE
  USING (public.can_access_dashboard() AND public.has_menu_permission('pp5_system'))
  WITH CHECK (public.can_access_dashboard() AND public.has_menu_permission('pp5_system'));

DROP POLICY IF EXISTS "Admin can delete student_personal" ON public.student_personal;
CREATE POLICY "Admin can delete student_personal"
  ON public.student_personal FOR DELETE
  USING (public.is_admin());
