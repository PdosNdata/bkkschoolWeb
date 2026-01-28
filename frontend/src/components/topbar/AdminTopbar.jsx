import { Bell, Search } from 'lucide-react'

export default function Topbar() {
  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold">ภาพรวมแดชบอร์ด</h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="pl-10 pr-4 py-2 border rounded-lg"
            placeholder="ค้นหาคำสั่งซื้อ, นักเรียน, หรือ ISBN..."
          />
        </div>

        <Bell />

        <div className="flex items-center gap-2">
          <img
            src="/avatar.png"
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="text-sm font-medium">ผู้ดูแลระบบ</p>
            <p className="text-xs text-gray-500">หัวหน้าบริหาร</p>
          </div>
        </div>
      </div>
    </header>
  )
}