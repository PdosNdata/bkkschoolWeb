import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Search, Eye, Clock, CheckCircle, ShoppingCart, XCircle, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'

const statusMap = {
  pending: { label: 'รอดำเนินการ', style: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'อนุมัติแล้ว', style: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  shipping: { label: 'กำลังจัดส่ง', style: 'bg-indigo-100 text-indigo-700', icon: ShoppingCart },
  completed: { label: 'จัดส่งสำเร็จ', style: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'ยกเลิก', style: 'bg-red-100 text-red-700', icon: XCircle },
}

const formatDate = (d) => {
  if (!d) return '-'
  const date = new Date(d)
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`
}

const PAGE_SIZE = 8

export default function MyOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])

  useEffect(() => { if (user?.id) fetchOrders() }, [user])

  const fetchOrders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const viewDetail = async (order) => {
    setSelectedOrder(order)
    const { data } = await supabase
      .from('order_items')
      .select('*, books(title, isbn, price)')
      .eq('order_id', order.id)
    setOrderItems(data || [])
  }

  const cancelOrder = async (id) => {
    const result = await Swal.fire({
      title: 'ยกเลิกคำสั่งซื้อ?',
      text: 'เมื่อยกเลิกแล้วจะไม่สามารถแก้ไขได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยกเลิกคำสั่งซื้อ',
      cancelButtonText: 'ปิด',
      confirmButtonColor: '#dc2626',
    })
    if (!result.isConfirmed) return

    const { error } = await supabase.from('orders').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', id)
    if (error) { Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: error.message }); return }
    Swal.fire({ icon: 'success', title: 'ยกเลิกสำเร็จ', timer: 1200, showConfirmButton: false })
    fetchOrders()
    setSelectedOrder(null)
  }

  const filtered = orders.filter(o => {
    const matchSearch = (o.order_number || '').toLowerCase().includes(search.toLowerCase()) || (o.classroom || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /><span className="ml-3 text-gray-500">กำลังโหลด...</span></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">คำสั่งซื้อของฉัน</h1>
        <p className="text-gray-500 text-sm mt-1">ติดตามสถานะคำสั่งซื้อหนังสือเรียนของคุณ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold">{orders.length}</p>
          <p className="text-xs text-gray-500 mt-1">ทั้งหมด</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</p>
          <p className="text-xs text-gray-500 mt-1">รอดำเนินการ</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'completed').length}</p>
          <p className="text-xs text-gray-500 mt-1">สำเร็จ</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{orders.filter(o => o.status === 'cancelled').length}</p>
          <p className="text-xs text-gray-500 mt-1">ยกเลิก</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-5">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="ค้นหารหัสคำสั่งซื้อ..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} />
          </div>
          <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}>
            <option value="all">ทุกสถานะ</option>
            {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Order List */}
        <div className="space-y-3">
          {paginated.map(order => {
            const st = statusMap[order.status] || statusMap.pending
            return (
              <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-blue-600">{order.order_number}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(order.created_at)} | {order.classroom || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${st.style}`}>{st.label}</span>
                    <span className="text-sm font-medium">{order.total_quantity} เล่ม</span>
                    <span className="text-sm font-bold">฿{Number(order.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => viewDetail(order)} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Eye size={13} /> ดูรายละเอียด</button>
                  {order.status === 'pending' && (
                    <button onClick={() => cancelOrder(order.id)} className="text-xs text-red-600 hover:underline flex items-center gap-1"><XCircle size={13} /> ยกเลิก</button>
                  )}
                </div>
              </div>
            )
          })}
          {paginated.length === 0 && <p className="text-center py-8 text-gray-400">{orders.length === 0 ? 'ยังไม่มีคำสั่งซื้อ' : 'ไม่พบรายการ'}</p>}
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">แสดง {(currentPage-1)*PAGE_SIZE+1}-{Math.min(currentPage*PAGE_SIZE, filtered.length)} จาก {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40">ก่อนหน้า</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40">ถัดไป</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-1">รายละเอียดคำสั่งซื้อ</h3>
            <p className="text-sm text-blue-600 mb-4">{selectedOrder.order_number}</p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div><span className="text-gray-500">วันที่:</span> {formatDate(selectedOrder.created_at)}</div>
              <div><span className="text-gray-500">ชั้นเรียน:</span> {selectedOrder.classroom || '-'}</div>
              <div><span className="text-gray-500">สถานะ:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${statusMap[selectedOrder.status]?.style}`}>{statusMap[selectedOrder.status]?.label}</span></div>
              <div><span className="text-gray-500">ยอดรวม:</span> ฿{Number(selectedOrder.total_amount || 0).toLocaleString()}</div>
            </div>

            <h4 className="font-medium text-sm mb-2">รายการหนังสือ</h4>
            <div className="space-y-2">
              {orderItems.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{item.books?.title || '-'}</p>
                    <p className="text-xs text-gray-400">฿{Number(item.unit_price).toLocaleString()} x {item.quantity}</p>
                  </div>
                  <p className="font-medium">฿{Number(item.total_price).toLocaleString()}</p>
                </div>
              ))}
              {orderItems.length === 0 && <p className="text-center text-gray-400 text-sm py-4">ไม่มีรายการ</p>}
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">ปิด</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
