import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { menuConfig } from '../config/menuConfig'

export default function Sidebar({ mobile = false, onClose }) {
  const { user } = useAuth()
  if (!user) return null

  const menus = menuConfig[user.role] || []

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
    {/* Logo */}
    <div className="p-6 flex items-center gap-3">
      <div className="bg-blue-600 text-white p-2 rounded-lg">🎓</div>
      <div>
        <p className="font-bold">ผู้ดูแลระบบหนังสือเรียน</p>
        <p className="text-xs text-gray-500">ผู้ดูแลระบบ</p>
      </div>
    </div>

    {/* Menu */}
    <nav className="flex-1 px-4 space-y-2">
      <SidebarItem label="แดชบอร์ด" active />
      <SidebarItem label="คำสั่งซื้อ" badge="12" />
      <SidebarItem label="คลังสินค้า" />
      <SidebarItem label="การจัดการผู้ใช้" />
      <SidebarItem label="การตั้งค่างบประมาณ" />
      <SidebarItem label="รายงาน" />
    </nav>

    {/* Logout */}
    <div className="p-4 border-t">
      <button className="text-gray-600 hover:text-red-500">
        ออกจากระบบ
      </button>
    </div>
  </aside>
  )
}
