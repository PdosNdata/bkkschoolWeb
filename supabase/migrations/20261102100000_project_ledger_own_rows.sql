-- บัญชีโครงการด้วยรักและห่วงใย: ให้แต่ละบัญชีเห็น/แก้ไข/ลบ "เฉพาะรายการของตัวเอง" — แอดมินเห็นและจัดการได้ทั้งหมด
-- (ต่อจาก 20261101100000_project_ledger.sql ที่ยังให้ผู้มีสิทธิ์เมนูอ่านรายการของทุกคนได้)
--
--   • อ่าน  : เจ้าของรายการ หรือแอดมิน (และต้องมีสิทธิ์เมนู project_ledger)
--   • เพิ่ม : ผู้มีสิทธิ์เมนู (บันทึกในชื่อตัวเองเท่านั้น) — ไม่เปลี่ยน
--   • แก้ไข/ลบ : เจ้าของรายการ หรือแอดมิน — ไม่เปลี่ยน

DROP POLICY IF EXISTS "Approved can read project_ledger" ON public.project_ledger;
DROP POLICY IF EXISTS "Owner or admin can read project_ledger" ON public.project_ledger;
CREATE POLICY "Owner or admin can read project_ledger"
  ON public.project_ledger FOR SELECT
  USING (
    public.can_access_dashboard()
    AND public.has_menu_permission('project_ledger')
    AND (created_by = auth.uid() OR public.is_admin())
  );

NOTIFY pgrst, 'reload schema';

-- ผลตรวจ: ควรได้ 4 แถว (อ่าน เพิ่ม แก้ไข ลบ)
SELECT policyname AS "นโยบาย", cmd AS "คำสั่ง" FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_ledger' ORDER BY cmd;
