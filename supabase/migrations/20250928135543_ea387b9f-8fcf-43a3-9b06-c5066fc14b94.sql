-- สร้างตารางบุคลากร
CREATE TABLE public.personnel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  subject_group TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  additional_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- เปิดใช้งาน RLS
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;

-- สร้าง policies สำหรับการเข้าถึงข้อมูล
CREATE POLICY "Anyone can view personnel" 
ON public.personnel 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create personnel" 
ON public.personnel 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update personnel" 
ON public.personnel 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete personnel" 
ON public.personnel 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- สร้าง trigger สำหรับ updated_at
CREATE TRIGGER update_personnel_updated_at
BEFORE UPDATE ON public.personnel
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();