import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Search, Bell, User } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Navbar() {
  const { user } = useAuth()
  const [openMenu, setOpenMenu] = useState(false)

  return (
    <>
      {/* Navbar */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-2xl text-gray-600"
            onClick={() => setOpenMenu(true)}
          >
            ☰
          </button>
          <h1 className="font-semibold text-lg hidden md:block">ภาพรวมแดชบอร์ด</h1>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาคำสั่งซื้อ, นักเรียน, หรือ ISBN..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">
                  {user.role === 'admin' ? 'ผู้ดูแลระบบ' : user.role === 'teacher' ? 'ครู' : user.role}
                </p>
              </div>
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-blue-600" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {openMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenMenu(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar mobile onClose={() => setOpenMenu(false)} />
          </div>
        </div>
      )}
    </>
  )
}
