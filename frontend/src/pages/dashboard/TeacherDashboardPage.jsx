import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ShoppingCart, Clock, CheckCircle, Search, Eye
} from 'lucide-react'

const mockOrders = [
  { id: 'ORD-2567-001', date: '15 พ.ค. 2567', classroom: 'ป.4/2', quantity: 8, status: 'จัดส่งสำเร็จ' },
  { id: 'ORD-2567-002', date: '18 พ.ค. 2567', classroom: 'ป.4/2', quantity: 5, status: 'จัดส่งสำเร็จ' },
  { id: 'ORD-2567-003', date: '22 พ.ค. 2567', classroom: 'ป.4/2', quantity: 12, status: 'กำลังจัดส่ง' },
  { id: 'ORD-2567-004', date: '25 พ.ค. 2567', classroom: 'ป.4/2', quantity: 6, status: 'จัดส่งสำเร็จ' },
  { id: 'ORD-2567-005', date: '28 พ.ค. 2567', classroom: 'ป.4/2', quantity: 10, status: 'รอดำเนินการ' },
  { id: 'ORD-2567-006', date: '1 มิ.ย. 2567', classroom: 'ป.4/2', quantity: 3, status: 'จัดส่งสำเร็จ' },
  { id: 'ORD-2567-007', date: '5 มิ.ย. 2567', classroom: 'ป.4/2', quantity: 7, status: 'จัดส่งสำเร็จ' },
  { id: 'ORD-2567-008', date: '10 มิ.ย. 2567', classroom: 'ป.4/2', quantity: 4, status: 'จัดส่งสำเร็จ' },
  { id: 'ORD-2567-009', date: '15 มิ.ย. 2567', classroom: 'ป.4/2', quantity: 9, status: 'จัดส่งสำเร็จ' },
  { id: 'ORD-2567-010', date: '18 มิ.ย. 2567', classroom: 'ป.4/2', quantity: 11, status: 'จัดส่งสำเร็จ' },
  { id: 'ORD-2567-011', date: '20 มิ.ย. 2567', classroom: 'ป.4/2', quantity: 2, status: 'รอดำเนินการ' },
  { id: 'ORD-2567-012', date: '22 มิ.ย. 2567', classroom: 'ป.4/2', quantity: 8, status: 'จัดส่งสำเร็จ' },
]

const statusStyles = {
  'รอดำเนินการ': 'bg-yellow-100 text-yellow-700',
  'กำลังจัดส่ง': 'bg-blue-100 text-blue-700',
  'จัดส่งสำเร็จ': 'bg-green-100 text-green-700',
  'ยกเลิก': 'bg-red-100 text-red-700',
}

const PAGE_SIZE = 5

export default function TeacherDashboardPage() {
  const { user } = useAuth()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด')
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = mockOrders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(searchText.toLowerCase()) ||
      o.classroom.toLowerCase().includes(searchText.toLowerCase())
    const matchStatus = statusFilter === 'ทั้งหมด' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const totalOrders = mockOrders.length
  const pendingOrders = mockOrders.filter(o => o.status === 'รอดำเนินการ').length
  const completedOrders = mockOrders.filter(o => o.status === 'จัดส่งสำเร็จ').length

  const stats = [
    { label: 'คำสั่งซื้อทั้งหมด', value: totalOrders, icon: ShoppingCart, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'รอดำเนินการ', value: pendingOrders, icon: Clock, iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'จัดส่งสำเร็จ', value: completedOrders, icon: CheckCircle, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">สถานะคำสั่งซื้อของฉัน</h1>
        <p className="text-gray-500 text-sm mt-1">ติดตามคำสั่งซื้อหนังสือเรียนประจำชั้นของคุณ</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <Icon size={24} className={stat.iconColor} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหารหัสคำสั่งซื้อ หรือ ชั้นเรียน..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1) }}
            />
          </div>
          <select
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
          >
            <option>ทั้งหมด</option>
            <option>รอดำเนินการ</option>
            <option>กำลังจัดส่ง</option>
            <option>จัดส่งสำเร็จ</option>
            <option>ยกเลิก</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-4 py-3 font-medium rounded-tl-lg">รหัสคำสั่งซื้อ</th>
                <th className="text-left px-4 py-3 font-medium">วันที่สั่งซื้อ</th>
                <th className="text-left px-4 py-3 font-medium">ชั้นเรียน</th>
                <th className="text-center px-4 py-3 font-medium">จำนวน (เล่ม)</th>
                <th className="text-center px-4 py-3 font-medium">สถานะ</th>
                <th className="text-center px-4 py-3 font-medium rounded-tr-lg">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-blue-600">{order.id}</td>
                  <td className="px-4 py-3 text-gray-600">{order.date}</td>
                  <td className="px-4 py-3 text-gray-600">{order.classroom}</td>
                  <td className="px-4 py-3 text-center">{order.quantity}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                      <Eye size={15} /> ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">ไม่พบรายการ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
          <p className="text-sm text-gray-500">
            แสดง {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} ถึง{' '}
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40"
            >
              ก่อนหน้า
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-lg text-sm ${page === currentPage ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
