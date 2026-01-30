import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Wallet,
  FileText,
  LogOut
} from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r px-4 py-6">
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-blue-600 text-white p-2 rounded">
          🎓
        </div>
        <div>
          <p className="font-bold">ระบบบริหารจัดการหนังสือเรียน</p>
          <p className="text-xs text-gray-500">ผู้ดูแลระบบ</p>
        </div>
      </div>

      <nav className="space-y-2">
        <NavItem to="/admin/dashboard" icon={<LayoutDashboard />} label="แดชบอร์ด" />
        <NavItem to="/admin/orders" icon={<ShoppingCart />} label="คำสั่งซื้อ" badge="12" />
        <NavItem to="/admin/budgets" icon={<Wallet />} label="การตั้งค่างบประมาณ" />
        <NavItem to="/admin/users" icon={<Users />} label="การจัดการผู้ใช้" />
        <NavItem to="/admin/reports" icon={<FileText />} label="รายงาน" />
      </nav>

      <div className="mt-auto pt-6">
        <button className="flex items-center gap-2 text-red-500">
          <LogOut size={18} /> ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}

function NavItem({ to, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700"
    >
      <div className="flex items-center gap-2">
        {icon}
        {label}
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-xs px-2 rounded-full">
          {badge}
        </span>
      )}
    </NavLink>
  )
}