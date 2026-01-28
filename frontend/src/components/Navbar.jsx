import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [openMenu, setOpenMenu] = useState(false)

  return (
    <>
      {/* Navbar */}
      <header className="h-14 bg-white shadow flex items-center justify-between px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setOpenMenu(true)}
          >
            ☰
          </button>

          <span className="font-semibold text-lg">
            ระบบสั่งหนังสือเรียน
          </span>
        </div>

        {/* Right */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user.name} ({user.role})
            </span>
            <button
              onClick={logout}
              className="text-sm hover:text-red-600"
            >
              ออกจากระบบ
            </button>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {openMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenMenu(false)}
          />

          {/* drawer */}
          <div className="absolute left-0 top-0 h-full">
            <Sidebar mobile onClose={() => setOpenMenu(false)} />
          </div>
        </div>
      )}
    </>
  )
}