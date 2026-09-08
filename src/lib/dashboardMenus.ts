// The canonical list of dashboard menu permissions.
//
// These `permissionName` values MUST match the `permissionName` fields of the
// cards rendered in src/pages/Dashboard.tsx. The admin screens that grant menu
// access (AdminPage, MenuPermissionsPage) write rows into `user_permissions`
// using exactly these names, so a granted permission always maps to a card.

export interface DashboardMenuPermission {
  permissionName: string;
  label: string;
}

export const DASHBOARD_MENU_PERMISSIONS: DashboardMenuPermission[] = [
  { permissionName: "attendance_system", label: "ระบบตรวจการมาเรียน" },
  { permissionName: "supplies_system", label: "ระบบงานพัสดุ" },
  { permissionName: "student_affairs", label: "ระบบกิจการนักเรียน" },
  { permissionName: "internal_activities", label: "กิจกรรมภายใน" },
  { permissionName: "all_activities", label: "กิจกรรมทั้งหมด" },
  { permissionName: "public_relations", label: "ประชาสัมพันธ์" },
  { permissionName: "media_library", label: "คลังสื่อออนไลน์" },
  { permissionName: "document_upload", label: "อัพโหลดเอกสาร" },
  { permissionName: "personnel_system", label: "ระบบบุคลากร" },
  { permissionName: "menu_permissions", label: "จัดการสิทธิ์เมนู" },
  { permissionName: "textbook_system", label: "ระบบหนังสือเรียน" },
  { permissionName: "admin_panel", label: "Admin" },
];
