-- ปพ.5 ออนไลน์: "ตั้งค่าข้อมูลหลัก" (ข้อมูลโรงเรียน ผู้อำนวยการ หัวหน้าวิชาการ หัวหน้ากลุ่มสาระ ครูที่ปรึกษา ภาคเรียน/ปีการศึกษา)
-- แก้ไขได้เฉพาะแอดมิน — ครู (ผู้ได้สิทธิ์ pp5_system) อ่านได้อย่างเดียว
-- (ก่อนหน้านี้ผู้ได้สิทธิ์ pp5_system แก้ได้ด้วย)
-- ต้องรัน 20261008120000_pp5_cloud.sql มาก่อน

DROP POLICY IF EXISTS "Approved adds pp5 settings" ON public.pp5_settings;
DROP POLICY IF EXISTS "Admin adds pp5 settings" ON public.pp5_settings;
CREATE POLICY "Admin adds pp5 settings"
  ON public.pp5_settings FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Approved updates pp5 settings" ON public.pp5_settings;
DROP POLICY IF EXISTS "Admin updates pp5 settings" ON public.pp5_settings;
CREATE POLICY "Admin updates pp5 settings"
  ON public.pp5_settings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

NOTIFY pgrst, 'reload schema';
