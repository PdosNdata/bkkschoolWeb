import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Printer, Download, FileText, Loader2, Calendar } from 'lucide-react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const gradeLabel = { kg2: 'อนุบาล 2', kg3: 'อนุบาล 3', p1: 'ป.1', p2: 'ป.2', p3: 'ป.3', p4: 'ป.4', p5: 'ป.5', p6: 'ป.6', m1: 'ม.1', m2: 'ม.2', m3: 'ม.3' }

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + 543)
  const [budgets, setBudgets] = useState([])
  const [orders, setOrders] = useState([])
  const reportRef = useRef(null)

  useEffect(() => { fetchData() }, [selectedYear])

  const fetchData = async () => {
    setLoading(true)
    const [budgetRes, orderRes] = await Promise.all([
      supabase.from('budgets').select('*').eq('year', selectedYear),
      supabase.from('orders').select('*').eq('year', selectedYear),
    ])
    setBudgets(budgetRes.data || [])
    setOrders(orderRes.data || [])
    setLoading(false)
  }

  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount || 0), 0)
  const totalUsed = budgets.reduce((s, b) => s + Number(b.used_amount || 0), 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const approvedOrders = orders.filter(o => o.status === 'approved' || o.status === 'completed').length
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length
  const totalOrderAmount = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0)

  // กราฟงบประมาณตามชั้นเรียน
  const budgetChartData = {
    labels: budgets.map(b => gradeLabel[b.grade] || b.grade),
    datasets: [
      { label: 'งบประมาณ', data: budgets.map(b => Number(b.amount)), backgroundColor: '#3b82f6' },
      { label: 'ใช้ไปแล้ว', data: budgets.map(b => Number(b.used_amount || 0)), backgroundColor: '#f59e0b' },
    ],
  }

  // กราฟสถานะคำสั่งซื้อ
  const orderStatusData = {
    labels: ['อนุมัติ/สำเร็จ', 'รอดำเนินการ', 'กำลังจัดส่ง', 'ยกเลิก'],
    datasets: [{
      data: [
        orders.filter(o => o.status === 'approved' || o.status === 'completed').length,
        pendingOrders,
        orders.filter(o => o.status === 'shipping').length,
        cancelledOrders,
      ],
      backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444'],
      borderWidth: 0,
    }],
  }

  const handlePrint = () => window.print()

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /><span className="ml-3 text-gray-500">กำลังโหลด...</span></div>
  }

  return (
    <div className="space-y-6" ref={reportRef}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">รายงาน</h1>
          <p className="text-gray-500 text-sm mt-1">สรุปภาพรวมระบบสั่งหนังสือเรียน</p>
        </div>
        <div className="flex gap-3">
          <select className="border rounded-xl px-4 py-2.5 text-sm" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
            {[0, -1, -2, 1].map(d => { const y = new Date().getFullYear() + 543 + d; return <option key={y} value={y}>{y}</option> })}
          </select>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm hover:bg-gray-50">
            <Printer size={16} /> พิมพ์รายงาน
          </button>
        </div>
      </div>

      {/* Report Header (for print) */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-xl font-bold">รายงานสรุปการสั่งหนังสือเรียน</h1>
        <p>ปีการศึกษา {selectedYear} — โรงเรียนบ้านค้อดอนแคน</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">งบประมาณทั้งหมด</p>
          <p className="text-xl font-bold mt-1">{totalBudget.toLocaleString()} บาท</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">ใช้ไปแล้ว</p>
          <p className="text-xl font-bold mt-1 text-blue-600">{totalUsed.toLocaleString()} บาท</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">คำสั่งซื้อทั้งหมด</p>
          <p className="text-xl font-bold mt-1">{totalOrders} รายการ</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">ยอดสั่งซื้อรวม</p>
          <p className="text-xl font-bold mt-1 text-green-600">{totalOrderAmount.toLocaleString()} บาท</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">งบประมาณตามระดับชั้น</h3>
          <div className="h-64">
            {budgets.length > 0 ? (
              <Bar data={budgetChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">ยังไม่มีข้อมูลงบประมาณ</div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">สถานะคำสั่งซื้อ</h3>
          <div className="h-64">
            {totalOrders > 0 ? (
              <Doughnut data={orderStatusData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">ยังไม่มีคำสั่งซื้อ</div>
            )}
          </div>
        </div>
      </div>

      {/* Budget Detail Table */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><FileText size={20} className="text-blue-600" /> รายละเอียดงบประมาณตามชั้นเรียน</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-medium">ระดับชั้น</th>
                <th className="text-right px-4 py-3 font-medium">งบประมาณ</th>
                <th className="text-right px-4 py-3 font-medium">ใช้ไปแล้ว</th>
                <th className="text-right px-4 py-3 font-medium">คงเหลือ</th>
                <th className="text-center px-4 py-3 font-medium">สัดส่วน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {budgets.map(b => {
                const amount = Number(b.amount)
                const used = Number(b.used_amount || 0)
                const pct = amount > 0 ? Math.round((used / amount) * 100) : 0
                return (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium">{gradeLabel[b.grade]}</td>
                    <td className="px-4 py-3 text-right">{amount.toLocaleString()} บาท</td>
                    <td className="px-4 py-3 text-right text-blue-600">{used.toLocaleString()} บาท</td>
                    <td className="px-4 py-3 text-right text-green-600">{(amount - used).toLocaleString()} บาท</td>
                    <td className="px-4 py-3 text-center">{pct}%</td>
                  </tr>
                )
              })}
              {budgets.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-gray-400">ไม่มีข้อมูล</td></tr>}
              {budgets.length > 0 && (
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3">รวมทั้งหมด</td>
                  <td className="px-4 py-3 text-right">{totalBudget.toLocaleString()} บาท</td>
                  <td className="px-4 py-3 text-right text-blue-600">{totalUsed.toLocaleString()} บาท</td>
                  <td className="px-4 py-3 text-right text-green-600">{(totalBudget - totalUsed).toLocaleString()} บาท</td>
                  <td className="px-4 py-3 text-center">{totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0}%</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
