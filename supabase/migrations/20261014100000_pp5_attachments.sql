-- ปพ.5 ออนไลน์: เอกสารแนบท้าย (อัปโหลดไฟล์) — เก็บในหน้า "ตั้งค่าข้อมูลหลัก"
--   คุณลักษณะอันพึงประสงค์ (และการอ่าน คิดวิเคราะห์ เขียนสื่อความ) · คำอธิบายรายวิชา · ตัวชี้วัด · ค่านิยม 12 ประการ
--
-- ไฟล์เก็บในที่เก็บไฟล์ (Storage) ชื่อ bucket "pp5-docs" (ไม่เปิดสาธารณะ) ส่วนรายการไฟล์เก็บในตาราง pp5_attachments
-- สิทธิ์: ทุกบัญชีเจ้าหน้าที่ที่เข้าแดชบอร์ดได้ ดู/ดาวน์โหลดได้ · อัปโหลด/ลบ ได้เฉพาะแอดมิน · anon เข้าไม่ได้
-- รันซ้ำได้ · ต้องมีฟังก์ชัน is_admin() / can_access_dashboard() อยู่แล้ว

-- ที่เก็บไฟล์ (ไม่สาธารณะ ไฟล์ละไม่เกิน 20 MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('pp5-docs', 'pp5-docs', false, 20971520)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 20971520;

DROP POLICY IF EXISTS "pp5 docs staff read" ON storage.objects;
CREATE POLICY "pp5 docs staff read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pp5-docs' AND public.can_access_dashboard());

DROP POLICY IF EXISTS "pp5 docs admin insert" ON storage.objects;
CREATE POLICY "pp5 docs admin insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pp5-docs' AND public.is_admin());

DROP POLICY IF EXISTS "pp5 docs admin update" ON storage.objects;
CREATE POLICY "pp5 docs admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'pp5-docs' AND public.is_admin())
  WITH CHECK (bucket_id = 'pp5-docs' AND public.is_admin());

DROP POLICY IF EXISTS "pp5 docs admin delete" ON storage.objects;
CREATE POLICY "pp5 docs admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'pp5-docs' AND public.is_admin());

-- รายการไฟล์
CREATE TABLE IF NOT EXISTS public.pp5_attachments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category     text NOT NULL CHECK (category IN ('attributes', 'course_desc', 'indicators', 'values12')),
  file_name    text NOT NULL,              -- ชื่อไฟล์เดิม (ภาษาไทยได้)
  storage_path text NOT NULL UNIQUE,       -- ที่อยู่ใน bucket pp5-docs (ชื่อสุ่ม ไม่ใช้ภาษาไทย)
  mime         text,
  size_bytes   bigint,
  uploaded_by  uuid DEFAULT auth.uid(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pp5_attachments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pp5_attachments FROM anon;
REVOKE ALL ON public.pp5_attachments FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pp5_attachments TO authenticated;

DROP POLICY IF EXISTS "Staff reads pp5 attachments" ON public.pp5_attachments;
CREATE POLICY "Staff reads pp5 attachments" ON public.pp5_attachments
  FOR SELECT USING (public.can_access_dashboard());

DROP POLICY IF EXISTS "Admin writes pp5 attachments" ON public.pp5_attachments;
CREATE POLICY "Admin writes pp5 attachments" ON public.pp5_attachments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

NOTIFY pgrst, 'reload schema';

-- ผลตรวจ: ควรได้ 1 แถว (bucket pp5-docs, ไม่สาธารณะ)
SELECT id AS "bucket", public AS "สาธารณะ", file_size_limit AS "ขนาดสูงสุด (ไบต์)" FROM storage.buckets WHERE id = 'pp5-docs';
