-- การอ่าน คิดวิเคราะห์ และเขียนสื่อความ (ตัวชี้วัดความสามารถ 5 ข้อ + ขอบเขตการประเมิน) แยกตามช่วงชั้น
-- ที่มา: ไฟล์ "การอ่าน คิดวิเคราะห์ และเขียนสื่อความ.docx" (ตัวเลขไทยแปลงเป็นเลขอารบิก) — มี 3 ช่วงชั้น: ป.1-3, ป.4-6, ม.1-3
--
-- ตาราง:
--   curriculum_reading_bands  ช่วงชั้น + ขอบเขตการประเมิน (1 แถวต่อช่วงชั้น)
--   curriculum_reading_items  ตัวชี้วัด ข้อ 1-5 ของแต่ละช่วงชั้น
-- สิทธิ์: ทุกบัญชีเจ้าหน้าที่ที่เข้าแดชบอร์ดได้ อ่านได้ · เพิ่ม/แก้/ลบ ได้เฉพาะแอดมิน
-- รันซ้ำได้ (ลบข้อมูลของช่วงชั้นเหล่านี้แล้วใส่ใหม่)

CREATE TABLE IF NOT EXISTS public.curriculum_reading_bands (
  band_code  text PRIMARY KEY,   -- ป.1-3 / ป.4-6 / ม.1-3
  level_text text NOT NULL,      -- เช่น ชั้นประถมศึกษาปีที่ 1 – 3
  scope      text NOT NULL       -- ขอบเขตการประเมิน
);

CREATE TABLE IF NOT EXISTS public.curriculum_reading_items (
  band_code   text NOT NULL REFERENCES public.curriculum_reading_bands (band_code) ON DELETE CASCADE ON UPDATE CASCADE,
  item_no     smallint NOT NULL,  -- ข้อ 1-5
  description text NOT NULL,
  PRIMARY KEY (band_code, item_no)
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['curriculum_reading_bands', 'curriculum_reading_items']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM public', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('DROP POLICY IF EXISTS "Staff reads %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "Staff reads %1$s" ON public.%1$I FOR SELECT USING (public.can_access_dashboard())', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin writes %1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "Admin writes %1$s" ON public.%1$I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
  END LOOP;
END $$;

-- ───────── ข้อมูล ─────────
DELETE FROM public.curriculum_reading_bands WHERE band_code IN ('ป.1-3', 'ป.4-6', 'ม.1-3');

INSERT INTO public.curriculum_reading_bands (band_code, level_text, scope) VALUES ('ป.1-3', 'ชั้นประถมศึกษาปีที่ 1 – 3', 'การอ่านจากสื่อสิ่งพิมพ์ และหรือสื่อประเภทต่าง ๆ ที่ให้ความเพลิดเพลิน ความรู้ ประสบการณ์และมีประเด็นให้คิด และเขียนบรรยายถ่ายทอดประเด็นที่คิดด้วยภาษาที่ถูกต้องเหมาะสม เช่น อ่านนิยาย เรื่องสั้น นิทาน นิยายปรัมปรา');
INSERT INTO public.curriculum_reading_items (band_code, item_no, description) VALUES
  ('ป.1-3', 1, 'สามารถอ่านและหาประสบการณ์จากสื่อที่หลากหลาย'),
  ('ป.1-3', 2, 'สามารถจับประเด็นสำคัญ ข้อเท็จจริง ความคิดเห็นจากเรื่องที่อ่าน'),
  ('ป.1-3', 3, 'สามารถเปรียบเทียบแง่มุมต่าง ๆ เช่น ข้อดี ข้อเสีย ประโยชน์ โทษ ความเหมาะสม ไม่เหมาะสม'),
  ('ป.1-3', 4, 'สามารถแสดงความคิดเห็นต่อเรื่องที่อ่าน โดยมีเหตุผลประกอบ'),
  ('ป.1-3', 5, 'สามารถถ่ายทอดความคิดเห็น ความรู้สึกจากเรื่องที่อ่านโดยการเขียน');

INSERT INTO public.curriculum_reading_bands (band_code, level_text, scope) VALUES ('ป.4-6', 'ชั้นประถมศึกษาปีที่ 4 – 6', 'การอ่านจากสื่อสิ่งพิมพ์ และหรือสื่อประเภทต่าง ๆ ที่ให้ข้อมูลสารสนเทศ ความรู้ ประสบการณ์ที่เอื้อให้ผู้อ่านนำไปคิดวิเคราะห์ แสดงความคิดเห็น ตัดสินใจ แก้ปัญหา และถ่ายทอดโดยการเขียนเป็นความเรียงเชิงสร้างสรรค์ด้วยถ้อยคำภาษาที่ถูกต้องชัดเจน เช่น อ่านหนังสือพิมพ์ วารสาร หนังสือเรียน บทความ สุนทรพจน์ คำแนะนำ คำเตือน');
INSERT INTO public.curriculum_reading_items (band_code, item_no, description) VALUES
  ('ป.4-6', 1, 'สามารถอ่านเพื่อหาข้อมูลสารสนเทศเสริมประสบการณ์จากสื่อประเภทต่าง ๆ'),
  ('ป.4-6', 2, 'สามารถจับประเด็นสำคัญ เปรียบเทียบ เชื่อมโยงความเป็นเหตุเป็นผลจากเรื่องที่อ่าน'),
  ('ป.4-6', 3, 'สามารถเชื่อมโยงความสัมพันธ์ของเรื่องราว เหตุการณ์ของเรื่องที่อ่าน'),
  ('ป.4-6', 4, 'สามารถแสดงความคิดเห็นต่อเรื่องที่อ่านโดยมีเหตุผลสนับสนุน'),
  ('ป.4-6', 5, 'สามารถถ่ายทอดความเข้าใจ ความคิดเห็น คุณค่าจากเรื่องที่อ่านโดยการเขียน');

INSERT INTO public.curriculum_reading_bands (band_code, level_text, scope) VALUES ('ม.1-3', 'ชั้นมัธยมศึกษาปีที่ 1 – 3', 'การอ่านจากสื่อสิ่งพิมพ์และสื่ออิเล็กทรอนิกส์ที่ให้ข้อมูลสารสนเทศ ข้อคิด ความรู้เกี่ยวกับสังคมและสิ่งแวดล้อมที่เอื้อให้ผู้อ่านนำไปคิดวิเคราะห์ วิจารณ์ สรุปแนวคิด คุณค่าที่ได้ นำไปประยุกต์ใช้ ด้วยวิจารณญาณ และถ่ายทอดเป็นข้อเขียนเชิงสร้างสรรค์หรือรายงานด้วยภาษาที่ถูกต้องเหมาะสม เช่น อ่านหนังสือพิมพ์ วารสาร หนังสือเรียน บทความ สุนทรพจน์ คำแนะนำ คำเตือน แผนภูมิ ตาราง แผนที่');
INSERT INTO public.curriculum_reading_items (band_code, item_no, description) VALUES
  ('ม.1-3', 1, 'สามารถคัดสรรสื่อที่ต้องการอ่านเพื่อหาข้อมูลสารสนเทศได้ตามวัตถุประสงค์ สามารถสร้างความเข้าใจและประยุกต์ใช้ความรู้จากการอ่าน'),
  ('ม.1-3', 2, 'สามารถจับประเด็นสำคัญและประเด็นสนับสนุน โต้แย้ง'),
  ('ม.1-3', 3, 'สามารถวิเคราะห์ วิจารณ์ ความสมเหตุสมผล ความน่าเชื่อถือ ลำดับความ และความเป็นไปได้ของเรื่องที่อ่าน'),
  ('ม.1-3', 4, 'สามารถสรุปคุณค่า แนวคิด แง่คิดที่ได้จากการอ่าน'),
  ('ม.1-3', 5, 'สามารถสรุป อภิปราย ขยายความ แสดงความคิดเห็น โต้แย้ง สนับสนุน โน้มน้าว โดยการเขียนสื่อสารในรูปแบบต่าง ๆ เช่น ผังความคิด เป็นต้น');

NOTIFY pgrst, 'reload schema';
