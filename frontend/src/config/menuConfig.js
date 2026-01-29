export const menuConfig = {
  admin: [
    { label: 'แดชบอร์ด', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'คำสั่งซื้อ', path: '/orders', icon: 'ShoppingCart', badge: '12' },
    { label: 'นักเรียน', path: '/students', icon: 'GraduationCap' },
    { label: 'คลังสินค้า', path: '/inventory', icon: 'Package' },
    { label: 'การจัดการผู้ใช้', path: '/users', icon: 'Users' },
    { label: 'การตั้งค่างบประมาณ', path: '/budget', icon: 'Wallet' },
    { label: 'รายงาน', path: '/reports', icon: 'FileText' },
    { label: 'ตั้งค่าผู้ใช้', path: '/profile', icon: 'Settings' },
  ],
  teacher: [
    { label: 'แดชบอร์ด', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'รายการหนังสือ', path: '/class-books', icon: 'BookOpen' },
    { label: 'คำสั่งซื้อของฉัน', path: '/my-orders', icon: 'ShoppingCart' },
    { label: 'ตั้งค่าผู้ใช้', path: '/profile', icon: 'Settings' },
  ],
  staff: [
    { label: 'แดชบอร์ด', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'คำสั่งซื้อ', path: '/orders', icon: 'ShoppingCart', badge: '12' },
    { label: 'คลังสินค้า', path: '/inventory', icon: 'Package' },
    { label: 'การจัดการผู้ใช้', path: '/users', icon: 'Users' },
    { label: 'การตั้งค่างบประมาณ', path: '/budget', icon: 'Wallet' },
    { label: 'รายงาน', path: '/reports', icon: 'FileText' },
    { label: 'ตั้งค่าผู้ใช้', path: '/profile', icon: 'Settings' },
  ],
  warehouse: [
    { label: 'แดชบอร์ด', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'คลังหนังสือ', path: '/inventory', icon: 'Package' },
    { label: 'ตั้งค่าผู้ใช้', path: '/profile', icon: 'Settings' },
  ],
}
