import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, Plus, Eye, Printer, Upload, CheckCircle, Clock, Loader2, FileText, User } from 'lucide-react'
import Swal from 'sweetalert2'
import jsPDF from 'jspdf'

const gradeLabel = { kg2: 'อนุบาล 2', kg3: 'อนุบาล 3', p1: 'ป.1', p2: 'ป.2', p3: 'ป.3', p4: 'ป.4', p5: 'ป.5', p6: 'ป.6', m1: 'ม.1', m2: 'ม.2', m3: 'ม.3' }
const PAGE_SIZE = 10

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [withdrawItems, setWithdrawItems] = useState({})
  const [signatureFile, setSignatureFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)

    // ดึงรายการเบิก
    const { data: wData } = await supabase
      .from('withdrawals')
      .select(`
        *,
        orders(order_number, classroom, grade, year, teacher_id, users(full_name)),
        withdrawal_items(book_id, requested_qty, approved_qty, books(title))
      `)
      .order('created_at', { ascending: false })

    // ดึงคำสั่งซื้อที่ยืนยันแล้ว (พร้อมให้เบิก)
    const { data: oData } = await supabase
      .from('orders')
      .select(`
        *,
        users(full_name),
        order_items(book_id, quantity, books(title, price))
      `)
      .not('status', 'eq', 'draft')
      .order('created_at', { ascending: false })

    setWithdrawals(wData || [])
    setOrders(oData || [])
    setLoading(false)
  }

  const openCreateModal = (order) => {
    setSelectedOrder(order)
    const items = {}
    order.order_items?.forEach(item => {
      items[item.book_id] = { requested: item.quantity, approved: item.quantity }
    })
    setWithdrawItems(items)
    setShowModal(true)
  }

  const openDetailModal = async (withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowDetailModal(true)
  }

  const handleCreateWithdrawal = async () => {
    if (!selectedOrder) return
    setSaving(true)

    // สร้างใบเบิก
    const withdrawalNumber = `WD-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    const { data: wData, error: wError } = await supabase.from('withdrawals').insert({
      order_id: selectedOrder.id,
      withdrawal_number: withdrawalNumber,
      status: 'pending',
      requested_by: selectedOrder.teacher_id,
    }).select().single()

    if (wError) {
      Swal.fire({ icon: 'error', title: 'สร้างใบเบิกไม่สำเร็จ', text: wError.message })
      setSaving(false)
      return
    }

    // สร้างรายการในใบเบิก
    const items = Object.entries(withdrawItems).map(([bookId, qty]) => ({
      withdrawal_id: wData.id,
      book_id: bookId,
      requested_qty: qty.requested,
      approved_qty: qty.approved,
    }))

    const { error: itemError } = await supabase.from('withdrawal_items').insert(items)

    if (itemError) {
      Swal.fire({ icon: 'error', title: 'เพิ่มรายการไม่สำเร็จ', text: itemError.message })
    } else {
      Swal.fire({ icon: 'success', title: 'สร้างใบเบิกสำเร็จ', text: `เลขที่: ${withdrawalNumber}`, confirmButtonColor: '#2563eb' })
      setShowModal(false)
      fetchData()
    }
    setSaving(false)
  }

  const handleApprove = async (withdrawal) => {
    const result = await Swal.fire({
      title: 'อนุมัติใบเบิก?',
      text: `เลขที่: ${withdrawal.withdrawal_number}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'อนุมัติ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#16a34a',
    })
    if (!result.isConfirmed) return

    await supabase.from('withdrawals').update({
      status: 'approved',
      approved_at: new Date().toISOString()
    }).eq('id', withdrawal.id)

    Swal.fire({ icon: 'success', title: 'อนุมัติสำเร็จ', timer: 1200, showConfirmButton: false })
    fetchData()
  }

  const handleSignatureUpload = async (e, withdrawalId) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExt = file.name.split('.').pop()
    const fileName = `signature_${withdrawalId}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('signatures')
      .upload(fileName, file)

    if (uploadError) {
      Swal.fire({ icon: 'error', title: 'อัพโหลดไม่สำเร็จ', text: uploadError.message })
      return
    }

    const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(fileName)

    await supabase.from('withdrawals').update({
      officer_signature: urlData.publicUrl
    }).eq('id', withdrawalId)

    Swal.fire({ icon: 'success', title: 'อัพโหลดลายเซ็นสำเร็จ', timer: 1200, showConfirmButton: false })
    fetchData()
  }

  const exportPDF = (withdrawal) => {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageW = doc.internal.pageSize.getWidth()

    // Header
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('ใบเบิกพัสดุ', pageW / 2, 20, { align: 'center' })

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`เล่มที่ ...............`, pageW - 50, 30)
    doc.text(`โรงเรียนบ้านค้อดอนแคน สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน`, 14, 40)
    doc.text(`เลขที่ ${withdrawal.withdrawal_number}`, pageW - 50, 40)

    const today = new Date()
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
    doc.text(`วันที่ ${today.getDate()} เดือน ${thaiMonths[today.getMonth()]} พ.ศ. ${today.getFullYear() + 543}`, pageW - 80, 47)

    const teacherName = withdrawal.orders?.users?.full_name || '-'
    const classroom = withdrawal.orders?.classroom || '-'
    doc.text(`ข้าพเจ้าของเบิกพัสดุตามรายการต่อไปนี้ เพื่อใช้ในงานการเรียนการสอนในชั้น${classroom}`, 14, 57)

    // Table header
    let y = 65
    doc.setFillColor(240, 240, 240)
    doc.rect(14, y, pageW - 28, 8, 'F')
    doc.setFont('Helvetica', 'bold')
    doc.text('เลขที่', 18, y + 6)
    doc.text('รายการ', 35, y + 6)
    doc.text('จำนวน/หน่วย', 120, y + 6)
    doc.text('หมายเหตุ', 170, y + 6)

    doc.text('ขอเบิก', 120, y + 12)
    doc.text('เบิกได้', 145, y + 12)
    y += 16

    // Table rows
    doc.setFont('Helvetica', 'normal')
    withdrawal.withdrawal_items?.forEach((item, idx) => {
      doc.text(String(idx + 1), 18, y + 5)
      doc.text((item.books?.title || '-').substring(0, 50), 35, y + 5)
      doc.text(String(item.requested_qty), 125, y + 5)
      doc.text(String(item.approved_qty), 150, y + 5)
      y += 8
    })

    // Signatures section
    y = 200
    doc.text('(ลงชื่อ)..........................................................ผู้เบิก', 14, y)
    doc.text(`(${teacherName})`, 25, y + 7)
    doc.text('ตำแหน่ง ครู', 25, y + 14)

    doc.text('อนุญาตให้เบิกได้', 120, y - 10)
    doc.text('(ลงชื่อ)..........................................................ผู้เบิก', 120, y)
    doc.text('ได้ตรวจหักจำนวนแล้ว', 120, y + 10)
    doc.text('(ลงชื่อ)..........................................................เจ้าหน้าที่พัสดุ', 120, y + 20)
    doc.text('ได้ตรวจรับของไปถูกต้องแล้ว', 120, y + 30)
    doc.text('(ลงชื่อ)..........................................................ผู้เบิก', 120, y + 40)

    doc.save(`ใบเบิกพัสดุ_${withdrawal.withdrawal_number}.pdf`)
  }

  const filtered = withdrawals.filter(w =>
    (w.withdrawal_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.orders?.classroom || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.orders?.users?.full_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const statusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
    }
    const labels = { pending: 'รออนุมัติ', approved: 'อนุมัติแล้ว', completed: 'เบิกแล้ว' }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /><span className="ml-3 text-gray-500">กำลังโหลด...</span></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">เบิกหนังสือ</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการใบเบิกหนังสือเรียน</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50"><FileText size={24} className="text-blue-600" /></div>
          <div><p className="text-sm text-gray-500">ใบเบิกทั้งหมด</p><p className="text-2xl font-bold">{withdrawals.length}</p></div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-50"><Clock size={24} className="text-yellow-600" /></div>
          <div><p className="text-sm text-gray-500">รออนุมัติ</p><p className="text-2xl font-bold">{withdrawals.filter(w => w.status === 'pending').length}</p></div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50"><CheckCircle size={24} className="text-green-600" /></div>
          <div><p className="text-sm text-gray-500">อนุมัติแล้ว</p><p className="text-2xl font-bold">{withdrawals.filter(w => w.status === 'approved').length}</p></div>
        </div>
      </div>

      {/* Orders that can be withdrawn */}
      {orders.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-4">คำสั่งซื้อที่พร้อมให้เบิก</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="text-left px-4 py-3 font-medium">เลขที่คำสั่งซื้อ</th>
                  <th className="text-left px-4 py-3 font-medium">ครูผู้สั่ง</th>
                  <th className="text-center px-4 py-3 font-medium">ชั้นเรียน</th>
                  <th className="text-center px-4 py-3 font-medium">ปี</th>
                  <th className="text-center px-4 py-3 font-medium">จำนวนรายการ</th>
                  <th className="text-center px-4 py-3 font-medium">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-blue-600">{order.order_number}</td>
                    <td className="px-4 py-3">{order.users?.full_name || '-'}</td>
                    <td className="px-4 py-3 text-center">{order.classroom}</td>
                    <td className="px-4 py-3 text-center">{order.year}</td>
                    <td className="px-4 py-3 text-center">{order.order_items?.length || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => openCreateModal(order)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
                        <Plus size={14} className="inline mr-1" /> สร้างใบเบิก
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Withdrawals List */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h3 className="font-semibold">รายการใบเบิก</h3>
          <div className="relative w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="ค้นหา..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-4 py-3 font-medium">เลขที่ใบเบิก</th>
                <th className="text-left px-4 py-3 font-medium">ผู้เบิก</th>
                <th className="text-center px-4 py-3 font-medium">ชั้นเรียน</th>
                <th className="text-center px-4 py-3 font-medium">วันที่</th>
                <th className="text-center px-4 py-3 font-medium">สถานะ</th>
                <th className="text-center px-4 py-3 font-medium">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map(w => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-blue-600">{w.withdrawal_number}</td>
                  <td className="px-4 py-3">{w.orders?.users?.full_name || '-'}</td>
                  <td className="px-4 py-3 text-center">{w.orders?.classroom || '-'}</td>
                  <td className="px-4 py-3 text-center">{new Date(w.created_at).toLocaleDateString('th-TH')}</td>
                  <td className="px-4 py-3 text-center">{statusBadge(w.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openDetailModal(w)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="ดูรายละเอียด"><Eye size={16} /></button>
                      <button onClick={() => exportPDF(w)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg" title="พิมพ์"><Printer size={16} /></button>
                      {w.status === 'pending' && (
                        <button onClick={() => handleApprove(w)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="อนุมัติ"><CheckCircle size={16} /></button>
                      )}
                      {w.status === 'approved' && !w.officer_signature && (
                        <>
                          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => handleSignatureUpload(e, w.id)} />
                          <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg" title="อัพโหลดลายเซ็น"><Upload size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">ไม่พบรายการ</td></tr>}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">แสดง {(currentPage - 1) * PAGE_SIZE + 1} ถึง {Math.min(currentPage * PAGE_SIZE, filtered.length)} จาก {filtered.length}</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1.5 rounded-lg text-sm ${p === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Withdrawal Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">สร้างใบเบิกหนังสือ</h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm"><span className="text-gray-500">เลขที่คำสั่งซื้อ:</span> <span className="font-medium">{selectedOrder.order_number}</span></p>
              <p className="text-sm"><span className="text-gray-500">ผู้เบิก:</span> <span className="font-medium">{selectedOrder.users?.full_name || '-'}</span></p>
              <p className="text-sm"><span className="text-gray-500">ชั้นเรียน:</span> <span className="font-medium">{selectedOrder.classroom}</span></p>
            </div>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-3 py-2">รายการ</th>
                  <th className="text-center px-3 py-2 w-24">ขอเบิก</th>
                  <th className="text-center px-3 py-2 w-24">เบิกได้</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.order_items?.map(item => (
                  <tr key={item.book_id} className="border-b">
                    <td className="px-3 py-2">{item.books?.title}</td>
                    <td className="px-3 py-2 text-center">{item.quantity}</td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        className="w-16 text-center border rounded px-2 py-1"
                        value={withdrawItems[item.book_id]?.approved || 0}
                        onChange={e => setWithdrawItems(p => ({
                          ...p,
                          [item.book_id]: { ...p[item.book_id], approved: Math.min(Number(e.target.value), item.quantity) }
                        }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleCreateWithdrawal} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin inline mr-2" /> : null}
                สร้างใบเบิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">รายละเอียดใบเบิก</h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm"><span className="text-gray-500">เลขที่:</span> <span className="font-medium">{selectedWithdrawal.withdrawal_number}</span></p>
              <p className="text-sm"><span className="text-gray-500">ผู้เบิก:</span> <span className="font-medium">{selectedWithdrawal.orders?.users?.full_name || '-'}</span></p>
              <p className="text-sm"><span className="text-gray-500">ชั้นเรียน:</span> <span className="font-medium">{selectedWithdrawal.orders?.classroom}</span></p>
              <p className="text-sm"><span className="text-gray-500">สถานะ:</span> {statusBadge(selectedWithdrawal.status)}</p>
            </div>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left px-3 py-2">รายการ</th>
                  <th className="text-center px-3 py-2">ขอเบิก</th>
                  <th className="text-center px-3 py-2">เบิกได้</th>
                </tr>
              </thead>
              <tbody>
                {selectedWithdrawal.withdrawal_items?.map((item, idx) => (
                  <tr key={item.book_id} className="border-b">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2">{item.books?.title}</td>
                    <td className="px-3 py-2 text-center">{item.requested_qty}</td>
                    <td className="px-3 py-2 text-center">{item.approved_qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedWithdrawal.officer_signature && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">ลายเซ็นเจ้าหน้าที่พัสดุ:</p>
                <img src={selectedWithdrawal.officer_signature} alt="ลายเซ็น" className="h-20 border rounded" />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">ปิด</button>
              <button onClick={() => exportPDF(selectedWithdrawal)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700">
                <Printer size={16} className="inline mr-2" /> พิมพ์ใบเบิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
