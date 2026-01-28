export const menuConfig = {
  admin: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'นักเรียน', path: '/students' },
    { label: 'ครู', path: '/teachers' },
    { label: 'หนังสือเรียน', path: '/books' },
    { label: 'รายงาน', path: '/reports' },
  ],
  teacher: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'หนังสือประจำชั้น', path: '/class-books' },
  ],
  staff: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'คำสั่งซื้อ', path: '/orders' },
  ],
  warehouse: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'คลังหนังสือ', path: '/inventory' },
  ],
}