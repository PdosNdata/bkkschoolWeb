import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, Plus, Package, Loader2, Calendar, Truck, CheckCircle, Save, X, Eye, Edit2 } from 'lucide-react'
import Swal from 'sweetalert2'

const gradeLabel = { kg2: 'อนุบาล 2', kg3: 'อนุบาล 3', p1: 'ป.1', p2: 'ป.2', p3: 'ป.3', p4: 'ป.4', p5: 'ป.5', p6: 'ป.6', m1: 'ม.1', m2: 'ม.2', m3: 'ม.3' }
const PAGE_SIZE = 10

export default function BookReceiptsPage() {
  const [orders, setOrders] = useState([])
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal states
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10))
  const [deliveryNumber, setDeliveryNumber] = useState(1)
  const [receiveItems, setReceiveItems] = useState({})
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedReceipts, setSelectedReceipts] = useState([])

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)

    // ดึงคำสั่งซื้อที่ยืนยันแล้ว (ไม่ใช่ draft)
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        *,
        users(full_name),
        order_items(id, book_id, quantity, received_quantity, books(title, price))
      `)
      .not('status', 'eq', 'draft')
      .order('created_at', { ascending: false })

    // ดึงประวัติการรับหนังสือ
    const { data: receiptsData } = await supabase
      .from('book_receipts')
      .select(`
        *,
        orders(order_number, classroom, grade, users(full_name)),
        book_receipt_items(book_id, received_qty, books(title))
      `)
      .order('receipt_date', { ascending: false })

    setOrders(ordersData || [])
    setReceipts(receiptsData || [])
    setLoading(false)
  }

  const openReceiveModal = (order) => {
    setSelectedOrder(order)
    setReceiptDate(new Date().toISOString().slice(0, 10))

    // หาว่าคำสั่งซื้อนี้รับมาแล้วกี่ครั้ง
    const orderReceipts = receipts.filter(r => r.order_id === order.id)
    setDeliveryNumber(orderReceipts.length + 1)

    // ตั้งค่าเริ่มต้นเป็น 0
    const items = {}
    order.order_items?.forEach(item => {
      items[item.book_id] = 0
    })
    setReceiveItems(items)
    setNotes('')
    setShowReceiveModal(true)
  }

  const handleReceive = async () => {
    // ตรวจสอบว่ามีการใส่จำนวนอย่างน้อย 1 รายการ
    const hasItems = Object.values(receiveItems).some(qty => qty > 0)
    if (!hasItems) {
      Swal.fire({ icon: 'warning', title: 'กรุณาใส่จำนวนรับอย่างน้อย 1 รายการ' })
      return
    }

    setSaving(true)

    // สร้างเลขที่ใบรับ
    const receiptNumber = `REC-${receiptDate.replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    // สร้างใบรับหนังสือ
    const { data: receiptData, error: receiptError } = await supabase
      .from('book_receipts')
      .insert({
        order_id: selectedOrder.id,
        receipt_number: receiptNumber,
        receipt_date: receiptDate,
        delivery_number: deliveryNumber,
        notes: notes || null,
      })
      .select()
      .single()

    if (receiptError) {
      Swal.fire({ icon: 'error', title: 'สร้างใบรับไม่สำเร็จ', text: receiptError.message })
      setSaving(false)
      return
    }

    // สร้างรายการในใบรับ
    const items = Object.entries(receiveItems)
      .filter(([_, qty]) => qty > 0)
      .map(([bookId, qty]) => ({
        receipt_id: receiptData.id,
        book_id: bookId,
        received_qty: qty,
      }))

    const { error: itemsError } = await supabase
      .from('book_receipt_items')
      .insert(items)

    if (itemsError) {
      Swal.fire({ icon: 'error', title: 'เพิ่มรายการไม่สำเร็จ', text: itemsError.message })
      setSaving(false)
      return
    }

    // อัพเดท received_quantity ใน order_items
    for (const [bookId, qty] of Object.entries(receiveItems)) {
      if (qty > 0) {
        const orderItem = selectedOrder.order_items.find(i => i.book_id === bookId)
        if (orderItem) {
          const newTotal = (orderItem.received_quantity || 0) + qty
          await supabase
            .from('order_items')
            .update({ received_quantity: newTotal })
            .eq('id', orderItem.id)
        }
      }
    }

    Swal.fire({
      icon: 'success',
      title: 'บันทึกการรับหนังสือสำเร็จ',
      text: `เลขที่: ${receiptNumber} (ครั้งที่ ${deliveryNumber})`,
      confirmButtonColor: '#2563eb'
    })

    setShowReceiveModal(false)
    fetchData()
    setSaving(false)
  }

  const openDetailModal = (order) => {
    const orderReceipts = receipts.filter(r => r.order_id === order.id)
    setSelectedReceipts(orderReceipts)
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const calcTotalReceived = (order) => {
    return order.order_items?.reduce((sum, item) => sum + (item.received_quantity || 0), 0) || 0
  }

  const calcTotalOrdered = (order) => {
    return order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  const getReceiptCount = (orderId) => {
    return receipts.filter(r => r.order_id === orderId).length
  }

  const filtered = orders.filter(o =>
    (o.order_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.users?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.classroom || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-gray-500">กำลังโหลด...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">รับหนังสือจากสำนักพิมพ์</h1>
          <p className="text-gray-500 text-sm mt-1">บันทึกการรับหนังสือจากสำนักพิมพ์ตามคำสั่งซื้อ</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50">
            <Package size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">คำสั่งซื้อทั้งหมด</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50">
            <Truck size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">รับครบแล้ว</p>
            <p className="text-2xl font-bold">
              {orders.filter(o => calcTotalReceived(o) >= calcTotalOrdered(o) && calcTotalOrdered(o) > 0).length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50">
            <Calendar size={24} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">รอรับเพิ่ม</p>
            <p className="text-2xl font-bold">
              {orders.filter(o => calcTotalReceived(o) < calcTotalOrdered(o)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h3 className="font-semibold">รายการคำสั่งซื้อ</h3>
          <div className="relative w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-4 py-3 font-medium">เลขที่คำสั่งซื้อ</th>
                <th className="text-left px-4 py-3 font-medium">ครูผู้สั่ง</th>
                <th className="text-center px-4 py-3 font-medium">ชั้น</th>
                <th className="text-center px-4 py-3 font-medium">ปี</th>
                <th className="text-center px-4 py-3 font-medium">สั่ง</th>
                <th className="text-center px-4 py-3 font-medium">รับแล้ว</th>
                <th className="text-center px-4 py-3 font-medium">ครั้งที่รับ</th>
                <th className="text-center px-4 py-3 font-medium">สถานะ</th>
                <th className="text-center px-4 py-3 font-medium">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map(order => {
                const totalOrdered = calcTotalOrdered(order)
                const totalReceived = calcTotalReceived(order)
                const receiptCount = getReceiptCount(order.id)
                const isComplete = totalReceived >= totalOrdered && totalOrdered > 0

                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-blue-600">{order.order_number}</td>
                    <td className="px-4 py-3">{order.users?.full_name || '-'}</td>
                    <td className="px-4 py-3 text-center">{gradeLabel[order.grade] || order.grade}</td>
                    <td className="px-4 py-3 text-center">{order.year}</td>
                    <td className="px-4 py-3 text-center font-medium">{totalOrdered}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
                        {totalReceived}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {receiptCount > 0 ? (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {receiptCount} ครั้ง
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isComplete ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle size={12} className="inline mr-1" />
                          รับครบแล้ว
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                          รอรับเพิ่ม
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {receiptCount > 0 && (
                          <button
                            onClick={() => openDetailModal(order)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="ดูประวัติการรับ"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => openReceiveModal(order)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 flex items-center gap-1"
                        >
                          <Plus size={14} /> รับหนังสือ
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    ไม่พบรายการ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              แสดง {(currentPage - 1) * PAGE_SIZE + 1} ถึง {Math.min(currentPage * PAGE_SIZE, filtered.length)} จาก {filtered.length}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${p === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Receive Modal */}
      {showReceiveModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">รับหนังสือจากสำนักพิมพ์</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                ครั้งที่ {deliveryNumber}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="text-gray-500">เลขที่คำสั่งซื้อ:</span> <span className="font-medium">{selectedOrder.order_number}</span></p>
                <p><span className="text-gray-500">ครูผู้สั่ง:</span> <span className="font-medium">{selectedOrder.users?.full_name || '-'}</span></p>
                <p><span className="text-gray-500">ชั้น:</span> <span className="font-medium">{gradeLabel[selectedOrder.grade] || selectedOrder.grade}</span></p>
                <p><span className="text-gray-500">ห้อง:</span> <span className="font-medium">{selectedOrder.classroom}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่รับ</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={receiptDate}
                  onChange={e => setReceiptDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="หมายเหตุ (ถ้ามี)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-3 py-2">#</th>
                    <th className="text-left px-3 py-2">รายการหนังสือ</th>
                    <th className="text-center px-3 py-2 w-24">สั่ง</th>
                    <th className="text-center px-3 py-2 w-24">รับแล้ว</th>
                    <th className="text-center px-3 py-2 w-24">คงเหลือ</th>
                    <th className="text-center px-3 py-2 w-28">รับครั้งนี้</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.order_items?.map((item, idx) => {
                    const remaining = item.quantity - (item.received_quantity || 0)
                    return (
                      <tr key={item.book_id} className="border-b">
                        <td className="px-3 py-3">{idx + 1}</td>
                        <td className="px-3 py-3">{item.books?.title}</td>
                        <td className="px-3 py-3 text-center">{item.quantity}</td>
                        <td className="px-3 py-3 text-center text-green-600 font-medium">{item.received_quantity || 0}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={remaining > 0 ? 'text-orange-600 font-medium' : 'text-gray-400'}>
                            {remaining}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max={remaining}
                            className="w-20 text-center border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={receiveItems[item.book_id] || 0}
                            onChange={e => {
                              const val = Math.min(Math.max(0, Number(e.target.value)), remaining)
                              setReceiveItems(prev => ({ ...prev, [item.book_id]: val }))
                            }}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                <strong>รวมรับครั้งนี้:</strong> {Object.values(receiveItems).reduce((a, b) => a + b, 0)} เล่ม
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReceiveModal(false)}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReceive}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                บันทึกการรับ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt History Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">ประวัติการรับหนังสือ</h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm"><span className="text-gray-500">เลขที่คำสั่งซื้อ:</span> <span className="font-medium">{selectedOrder.order_number}</span></p>
              <p className="text-sm"><span className="text-gray-500">ครูผู้สั่ง:</span> <span className="font-medium">{selectedOrder.users?.full_name || '-'}</span></p>
            </div>

            <div className="space-y-4">
              {selectedReceipts.map((receipt, idx) => (
                <div key={receipt.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-blue-700">ครั้งที่ {receipt.delivery_number}</span>
                      <span className="text-sm text-gray-500 ml-3">
                        {new Date(receipt.receipt_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{receipt.receipt_number}</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2">รายการ</th>
                        <th className="text-center px-4 py-2 w-24">จำนวนรับ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipt.book_receipt_items?.map(item => (
                        <tr key={item.book_id} className="border-t">
                          <td className="px-4 py-2">{item.books?.title}</td>
                          <td className="px-4 py-2 text-center font-medium text-green-600">{item.received_qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {receipt.notes && (
                    <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 border-t">
                      <strong>หมายเหตุ:</strong> {receipt.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
