
-- อนุญาตให้ทุกคนแก้ไขข่าวได้
CREATE POLICY "Anyone can update news"
ON public.news
FOR UPDATE
USING (true)
WITH CHECK (true);

-- อนุญาตให้ทุกคนลบข่าวได้ (สอดคล้องกับปุ่มลบใน UI)
CREATE POLICY "Anyone can delete news"
ON public.news
FOR DELETE
USING (true);
