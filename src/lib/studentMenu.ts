// เมนูย่อยของการ์ด "นักเรียน" ในหน้าระบบจัดการโรงเรียน (รวมระบบตรวจการมาเรียน + ระบบกิจการนักเรียน)
// สิทธิ์ยังใช้ชื่อเดิม (attendance_system, student_affairs) จึงไม่ต้องแก้ฐานข้อมูล
export const STUDENT_HUB_PERMISSION = "student_hub"; // ใช้เป็นคีย์สี/ภาพของการ์ดเท่านั้น ไม่ใช่สิทธิ์จริง

export interface StudentMenuItem {
  permissionName: string;
  title: string;
  description: string;
  href: string;
  /** ทุกบัญชีครูเห็น (เหมือนการ์ดเดิมในหน้าหลัก) */
  everyone?: boolean;
}

export const STUDENT_MENU_ITEMS: StudentMenuItem[] = [
  { permissionName: "attendance_system", title: "ระบบตรวจการมาเรียน", description: "การมาและกลับของนักเรียน", href: "/studentall" },
  { permissionName: "student_affairs", title: "ระบบกิจการนักเรียน", description: "การจัดกิจกรรมทั้งภายในและภายนอกโรงเรียน", href: "/StudentForm" },
  { permissionName: "students_system", title: "ข้อมูลนักเรียน", description: "ทะเบียนรายชื่อนักเรียน ใช้ร่วมกันทุกระบบ", href: "/students", everyone: true },
];
