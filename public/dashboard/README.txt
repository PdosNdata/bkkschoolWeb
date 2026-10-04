ภาพประกอบการ์ดหน้าแดชบอร์ด (Dashboard card artwork)
=====================================================
วางไฟล์ภาพของคุณในโฟลเดอร์นี้ แล้วระบุในไฟล์ manifest.json ว่าการ์ดไหนใช้ไฟล์ไหน
การ์ดที่ไม่ได้ระบุ จะใช้ภาพประกอบที่วาดไว้ในโค้ดตามเดิม

ตัวอย่าง manifest.json
{
  "attendance_system": "attendance.png",
  "omr_system": "omr.webp?v=2"
}

ชื่อการ์ด (คีย์ซ้ายมือ):
  attendance_system   ระบบตรวจการมาเรียน      supplies_system     ระบบงานพัสดุ
  student_affairs     ระบบกิจการนักเรียน        internal_activities โครงการด้วยรักและห่วงใย
  all_activities      กิจกรรมทั้งหมด            public_relations    ประชาสัมพันธ์
  media_library       คลังสื่อออนไลน์           document_upload     อัพโหลดเอกสาร
  personnel_system    ระบบบุคลากร              students_system     ข้อมูลนักเรียน
  omr_system          ระบบตรวจคำตอบปรนัย       teacher_import      นำเข้าข้อมูลครู
  menu_permissions    จัดการสิทธิ์เมนู           textbook_system     ระบบหนังสือเรียน
  home_slider         จัดการสไลด์หน้าแรก        admin_panel         Admin

คำแนะนำไฟล์ภาพ
  - PNG / WebP / SVG พื้นหลังโปร่งใส ขนาดประมาณ 480 x 360 พิกเซล (สัดส่วน 4:3)
  - ภาพจะวางที่มุมขวาล่างของการ์ด ควรให้ตัวภาพชิดขวา-ล่าง
  - เว็บเก็บแคชไฟล์ภาพไว้นาน ถ้าเปลี่ยนภาพเดิมให้ตั้งชื่อไฟล์ใหม่ หรือเติม ?v=2 ต่อท้ายใน manifest.json
