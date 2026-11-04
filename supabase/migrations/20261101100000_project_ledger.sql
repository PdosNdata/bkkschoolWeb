-- บัญชีรายรับ-รายจ่ายรายวันของโครงการด้วยรักและห่วงใย (เลี้ยงปลาดุก กบ ไก่ หมูป่า ปลูกผัก มะนาว ฯลฯ)
-- หน้าเว็บ: /project-ledger (เมนู "บัญชีโครงการด้วยรัก" ในหน้าระบบจัดการโรงเรียน)
--
-- สิทธิ์:
--   • อ่าน/เพิ่ม : แอดมิน หรือบัญชีที่แอดมินติ๊กเมนู "บัญชีโครงการด้วยรัก" (project_ledger) ที่หน้า "จัดการสิทธิ์เมนู"
--   • แก้ไข/ลบ  : เจ้าของรายการ (ผู้บันทึก) หรือแอดมิน
--   • ผู้ที่ยังไม่ล็อกอิน (anon) เข้าถึงไม่ได้เลย

CREATE TABLE IF NOT EXISTS public.project_ledger (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date  date NOT NULL DEFAULT current_date,
  project_key text NOT NULL CHECK (length(btrim(project_key)) > 0),   -- catfish frog chicken boar veg lime vine dragon mulberry otherveg
  kind        text NOT NULL CHECK (kind IN ('expense', 'income')),    -- รายจ่าย / รายรับ
  item        text NOT NULL CHECK (length(btrim(item)) > 0),          -- เช่น ซื้ออาหารปลา
  qty         numeric CHECK (qty IS NULL OR qty >= 0),
  unit        text,
  amount      numeric(12, 2) NOT NULL CHECK (amount >= 0),            -- จำนวนเงินรวมของรายการ (บาท)
  note        text,
  created_by  uuid NOT NULL DEFAULT auth.uid(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.project_ledger IS 'บัญชีรายรับ-รายจ่ายรายวันของโครงการด้วยรักและห่วงใย';

CREATE INDEX IF NOT EXISTS project_ledger_date_idx ON public.project_ledger (entry_date DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS project_ledger_project_idx ON public.project_ledger (project_key, entry_date DESC);

ALTER TABLE public.project_ledger ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.project_ledger FROM anon;
REVOKE ALL ON public.project_ledger FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_ledger TO authenticated;

DROP POLICY IF EXISTS "Approved can read project_ledger" ON public.project_ledger;
CREATE POLICY "Approved can read project_ledger"
  ON public.project_ledger FOR SELECT
  USING (public.can_access_dashboard() AND public.has_menu_permission('project_ledger'));

DROP POLICY IF EXISTS "Approved can add project_ledger" ON public.project_ledger;
CREATE POLICY "Approved can add project_ledger"
  ON public.project_ledger FOR INSERT
  WITH CHECK (public.can_access_dashboard() AND public.has_menu_permission('project_ledger') AND created_by = auth.uid());

DROP POLICY IF EXISTS "Owner or admin can edit project_ledger" ON public.project_ledger;
CREATE POLICY "Owner or admin can edit project_ledger"
  ON public.project_ledger FOR UPDATE
  USING (public.can_access_dashboard() AND public.has_menu_permission('project_ledger') AND (created_by = auth.uid() OR public.is_admin()))
  WITH CHECK (public.can_access_dashboard() AND public.has_menu_permission('project_ledger') AND (created_by = auth.uid() OR public.is_admin()));

DROP POLICY IF EXISTS "Owner or admin can delete project_ledger" ON public.project_ledger;
CREATE POLICY "Owner or admin can delete project_ledger"
  ON public.project_ledger FOR DELETE
  USING (public.can_access_dashboard() AND public.has_menu_permission('project_ledger') AND (created_by = auth.uid() OR public.is_admin()));

NOTIFY pgrst, 'reload schema';

-- ผลตรวจ: ควรได้ 1 แถว (ตารางมีแล้ว เปิด RLS แล้ว)
SELECT tablename AS "ตาราง", rowsecurity AS "เปิด RLS" FROM pg_tables WHERE schemaname = 'public' AND tablename = 'project_ledger';
