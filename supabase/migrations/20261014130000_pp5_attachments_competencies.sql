-- เอกสารแนบท้าย ปพ.5: เพิ่มหมวด "สมรรถนะสำคัญของผู้เรียน" (competencies) ในตาราง pp5_attachments
-- ต้องรัน 20261014100000_pp5_attachments.sql มาก่อน · รันซ้ำได้

ALTER TABLE public.pp5_attachments DROP CONSTRAINT IF EXISTS pp5_attachments_category_check;
ALTER TABLE public.pp5_attachments
  ADD CONSTRAINT pp5_attachments_category_check
  CHECK (category IN ('attributes', 'competencies', 'course_desc', 'indicators', 'values12'));

NOTIFY pgrst, 'reload schema';
