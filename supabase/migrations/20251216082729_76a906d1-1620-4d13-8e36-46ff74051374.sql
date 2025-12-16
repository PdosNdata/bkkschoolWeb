-- Create textbooks table
CREATE TABLE public.textbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create textbook_transactions table
CREATE TABLE public.textbook_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  textbook_id UUID REFERENCES public.textbooks(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('distributed', 'restock', 'lost', 'returned')),
  quantity INTEGER NOT NULL DEFAULT 1,
  user_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'student', 'admin')),
  user_reference TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('completed', 'processing', 'flagged', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create textbook_requests table
CREATE TABLE public.textbook_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  textbook_id UUID REFERENCES public.textbooks(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbook_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbook_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for textbooks
CREATE POLICY "Anyone can view textbooks" ON public.textbooks FOR SELECT USING (true);
CREATE POLICY "Admins and teachers can manage textbooks" ON public.textbooks FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher') AND approved = true)
);

-- RLS policies for transactions
CREATE POLICY "Anyone can view transactions" ON public.textbook_transactions FOR SELECT USING (true);
CREATE POLICY "Admins and teachers can manage transactions" ON public.textbook_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher') AND approved = true)
);

-- RLS policies for requests
CREATE POLICY "Anyone can view requests" ON public.textbook_requests FOR SELECT USING (true);
CREATE POLICY "Admins and teachers can manage requests" ON public.textbook_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher') AND approved = true)
);

-- Triggers for updated_at
CREATE TRIGGER update_textbooks_updated_at BEFORE UPDATE ON public.textbooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_textbook_transactions_updated_at BEFORE UPDATE ON public.textbook_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_textbook_requests_updated_at BEFORE UPDATE ON public.textbook_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.textbooks (title, subject, grade_level, quantity, low_stock_threshold) VALUES
('ภาษาไทย ป.3 เล่ม 2', 'ภาษาไทย', 'P3', 45, 10),
('English Grammar M2', 'ภาษาอังกฤษ', 'M2', 32, 10),
('Social Studies K3', 'สังคมศึกษา', 'K3', 28, 10),
('Science Grade 4', 'วิทยาศาสตร์', 'P4', 2, 10),
('Mathematics M1', 'คณิตศาสตร์', 'M1', 55, 10),
('ภาษาไทย ป.1', 'ภาษาไทย', 'P1', 40, 10),
('ภาษาไทย ป.2', 'ภาษาไทย', 'P2', 42, 10),
('ภาษาไทย ป.5', 'ภาษาไทย', 'P5', 60, 10),
('ภาษาไทย ป.6', 'ภาษาไทย', 'P6', 55, 10),
('ภาษาไทย ม.2', 'ภาษาไทย', 'M2', 48, 10),
('ภาษาไทย ม.3', 'ภาษาไทย', 'M3', 45, 10),
('อนุบาล 2', 'ทั่วไป', 'K2', 25, 10),
('อนุบาล 3', 'ทั่วไป', 'K3', 35, 10);