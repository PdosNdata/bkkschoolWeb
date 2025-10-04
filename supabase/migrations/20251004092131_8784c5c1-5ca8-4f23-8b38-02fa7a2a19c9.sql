-- Add category column to activities table
ALTER TABLE public.activities 
ADD COLUMN category text DEFAULT 'กิจกรรมภายใน';

-- Add comment to describe the column
COMMENT ON COLUMN public.activities.category IS 'ประเภทกิจกรรม: กิจกรรมด้วยรักและห่วงใย, กิจกรรมภายใน, กิจกรรมภายนอก';