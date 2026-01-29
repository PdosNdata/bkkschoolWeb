-- =====================================================
-- BKK Book System - Database Schema
-- ระบบสั่งหนังสือเรียน โรงเรียนบ้านค้อดอนแคน
-- =====================================================
-- ใช้รันใน Supabase SQL Editor

-- =====================================================
-- 1. ENUM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'teacher');

CREATE TYPE education_level AS ENUM ('kindergarten', 'primary', 'secondary');

CREATE TYPE grade_level AS ENUM (
  'kg2', 'kg3',
  'p1', 'p2', 'p3', 'p4', 'p5', 'p6',
  'm1', 'm2', 'm3'
);

CREATE TYPE order_status AS ENUM (
  'pending',        -- รอดำเนินการ
  'approved',       -- อนุมัติแล้ว
  'shipping',       -- กำลังจัดส่ง
  'completed',      -- จัดส่งสำเร็จ
  'cancelled'       -- ยกเลิก
);

-- =====================================================
-- 2. USERS TABLE (ผู้ใช้งาน)
-- =====================================================
-- เชื่อมกับ Supabase Auth (auth.users)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'teacher',
  phone TEXT,
  classroom TEXT,              -- ชั้นเรียนที่รับผิดชอบ เช่น 'ป.4/2'
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. BUDGETS TABLE (งบประมาณ)
-- =====================================================

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,                          -- ปีการศึกษา เช่น 2567
  level education_level NOT NULL,
  grade grade_level NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,        -- จำนวนเงิน (บาท)
  used_amount NUMERIC(12,2) NOT NULL DEFAULT 0,   -- ใช้ไปแล้ว (บาท)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(year, grade)
);

-- =====================================================
-- 4. BOOKS TABLE (หนังสือเรียน)
-- =====================================================

CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,                    -- ชื่อหนังสือ
  isbn TEXT UNIQUE,                       -- รหัส ISBN
  author TEXT,                            -- ผู้แต่ง
  publisher TEXT,                         -- สำนักพิมพ์
  price NUMERIC(10,2) NOT NULL DEFAULT 0, -- ราคา (บาท)
  level education_level NOT NULL,
  grade grade_level NOT NULL,
  subject TEXT,                           -- วิชา
  cover_url TEXT,                         -- รูปปกหนังสือ
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 5. ORDERS TABLE (คำสั่งซื้อ)
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,      -- รหัสคำสั่งซื้อ เช่น ORD-2567-001
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  classroom TEXT NOT NULL,                -- ชั้นเรียน เช่น 'ป.4/2'
  grade grade_level NOT NULL,
  year INTEGER NOT NULL,                  -- ปีการศึกษา
  status order_status NOT NULL DEFAULT 'pending',
  total_quantity INTEGER NOT NULL DEFAULT 0,    -- จำนวนเล่มทั้งหมด
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0, -- ยอดรวม (บาท)
  note TEXT,                              -- หมายเหตุ
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 6. ORDER_ITEMS TABLE (รายการสั่งซื้อ)
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,      -- ราคาต่อเล่ม ณ ตอนสั่ง
  total_price NUMERIC(12,2) NOT NULL,     -- quantity * unit_price
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 7. INVENTORY TABLE (คลังหนังสือ)
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  stock_quantity INTEGER NOT NULL DEFAULT 0,  -- จำนวนคงเหลือในคลัง
  min_quantity INTEGER NOT NULL DEFAULT 5,    -- จำนวนขั้นต่ำ (แจ้งเตือน)
  location TEXT,                              -- ตำแหน่งในคลัง
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(book_id)
);

-- =====================================================
-- 8. INVENTORY_LOGS TABLE (ประวัติเคลื่อนไหวคลัง)
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  change_quantity INTEGER NOT NULL,       -- +เข้า / -ออก
  reason TEXT,                            -- เหตุผล เช่น 'รับเข้าคลัง', 'จัดส่งคำสั่งซื้อ'
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 9. NOTIFICATIONS TABLE (การแจ้งเตือน)
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',               -- info, success, warning, error
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,                              -- URL เมื่อกดแจ้งเตือน
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 10. INDEXES
-- =====================================================

CREATE INDEX idx_budgets_year ON budgets(year);
CREATE INDEX idx_books_grade ON books(grade);
CREATE INDEX idx_books_level ON books(level);
CREATE INDEX idx_orders_teacher ON orders(teacher_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_year ON orders(year);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_book ON order_items(book_id);
CREATE INDEX idx_inventory_book ON inventory(book_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

-- =====================================================
-- 11. AUTO-UPDATE updated_at TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_books_updated_at
  BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users: อ่านได้ทุกคน, แก้ไขได้เฉพาะตัวเอง/admin
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can manage users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Budgets: อ่านได้ทุกคน, แก้ไขได้เฉพาะ admin/staff
CREATE POLICY "Anyone can view budgets" ON budgets FOR SELECT USING (true);
CREATE POLICY "Admin can manage budgets" ON budgets FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin'))
);

-- Books: อ่านได้ทุกคน, แก้ไขได้เฉพาะ admin/staff
CREATE POLICY "Anyone can view books" ON books FOR SELECT USING (true);
CREATE POLICY "Admin can manage books" ON books FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin'))
);

-- Orders: ครูเห็นเฉพาะของตัวเอง, admin/staff เห็นทั้งหมด
CREATE POLICY "Teachers see own orders" ON orders FOR SELECT USING (
  teacher_id = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin'))
);
CREATE POLICY "Teachers can create orders" ON orders FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Admin can manage orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin'))
);

-- Order Items: ตาม order policy
CREATE POLICY "View order items" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id
    AND (orders.teacher_id = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin')))
  )
);
CREATE POLICY "Admin manage order items" ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin'))
);

-- Inventory: อ่านได้ทุกคน, แก้ไขได้เฉพาะ admin/staff/warehouse
CREATE POLICY "Anyone can view inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Warehouse/Admin can manage inventory" ON inventory FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin'))
);

-- Inventory Logs: อ่านได้ทุกคน, เขียนได้เฉพาะ admin/staff/warehouse
CREATE POLICY "Anyone can view inventory logs" ON inventory_logs FOR SELECT USING (true);
CREATE POLICY "Warehouse/Admin can log inventory" ON inventory_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin'))
);

-- Notifications: เห็นเฉพาะของตัวเอง
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- =====================================================
-- 13. AUTO-GENERATE ORDER NUMBER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(order_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO next_seq
  FROM orders
  WHERE year = NEW.year;

  NEW.order_number := 'ORD-' || NEW.year || '-' || LPAD(next_seq::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();
