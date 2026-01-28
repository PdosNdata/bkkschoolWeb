import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ClipboardList, CheckCircle, Wallet, GraduationCap,
  Printer, Plus, AlertCircle, X, ArrowRight
} from 'lucide-react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
)

export default function DashboardPage() {
  const { user } = useAuth()
  const [showAlert, setShowAlert] = useState(true)

  const stats = [
    {
      label: 'รออนุมัติ',
      value: '12',
      unit: 'คำสั่งซื้อ',
      change: '+2 รายการใหม่',
      changeColor: 'text-orange-500',
      icon: ClipboardList,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      label: 'คำสั่งซื้อที่อนุมัติแล้ว',
      value: '450',
      unit: 'คำสั่งซื้อ',
      change: '+15 วันนี้',
      changeColor: 'text-green-500',
      icon: CheckCircle,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      label: 'งบประมาณที่ใช้ไป',
      value: '฿1.2M',
      unit: '/ 5.0M',
      change: 'ใช้ไป 24%',
      changeColor: 'text-blue-500',
      icon: Wallet,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      progress: 24,
    },
    {
      label: 'นักเรียนทั้งหมด',
      value: '1,250',
      unit: 'คน',
      icon: GraduationCap,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
  ]

  const lineData = {
    labels: ['พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.'],
    datasets: [
      {
        label: 'คำสั่งซื้อ',
        data: [30, 55, 45, 80, 70, 95],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#2563eb',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 12 } } },
      x: { grid: { display: false }, ticks: { font: { size: 12 } } },
    },
  }

  const doughnutData = {
    labels: ['อนุมัติแล้ว', 'รอดำเนินการ', 'กำลังดำเนินการ', 'ยกเลิกแล้ว'],
    datasets: [
      {
        data: [55, 25, 10, 10],
        backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  }

  const doughnutPlugin = {
    id: 'centerText',
    beforeDraw(chart) {
      const { width, height, ctx } = chart
      ctx.restore()
      ctx.font = 'bold 24px Sarabun, sans-serif'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#1f2937'
      ctx.fillText('528', width / 2, height / 2 - 10)
      ctx.font = '12px Sarabun, sans-serif'
      ctx.fillStyle = '#9ca3af'
      ctx.fillText('คำสั่งซื้อทั้งหมด', width / 2, height / 2 + 14)
      ctx.save()
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ยินดีต้อนรับกลับ, {user?.name || 'ผู้ดูแลระบบ'}</h1>
          <p className="text-gray-500 text-sm mt-1">
            นี่คือภาพรวมคำสั่งซื้อหนังสือเรียนประจำปีการศึกษา 2567.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
            <Printer size={16} />
            พิมพ์รายงาน
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700">
            <Plus size={16} />
            คำสั่งซื้อใหม่
          </button>
        </div>
      </div>

      {/* Alert */}
      {showAlert && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-5 py-3">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-blue-600" />
            <p className="text-sm">
              <span className="font-medium">ต้องการความสนใจ:</span>{' '}
              คุณมี 5 การแจ้งเตือนที่ยังไม่ได้อ่านเกี่ยวกับคำสั่งซื้อหนังสือเรียนใหม่
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
              ตรวจสอบตอนนี้ <ArrowRight size={14} />
            </button>
            <button onClick={() => setShowAlert(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                  <Icon size={20} className={stat.iconColor} />
                </div>
                {stat.change && (
                  <span className={`text-xs font-medium ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">
                {stat.value}
                <span className="text-sm font-normal text-gray-400 ml-1">{stat.unit}</span>
              </p>
              {stat.progress !== undefined && (
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">แนวโน้มคำสั่งซื้อ</h3>
              <p className="text-sm text-gray-400">ปริมาณคำสั่งซื้อรายเดือนใน 6 เดือนที่ผ่านมา</p>
            </div>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
              <option>6 เดือนที่ผ่านมา</option>
              <option>12 เดือนที่ผ่านมา</option>
            </select>
          </div>
          <div className="h-64">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold mb-4">การกระจายสถานะคำสั่งซื้อ</h3>
          <div className="h-48">
            <Doughnut data={doughnutData} options={doughnutOptions} plugins={[doughnutPlugin]} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { label: 'อนุมัติแล้ว', pct: '55%', color: 'bg-green-500' },
              { label: 'รอดำเนินการ', pct: '25%', color: 'bg-yellow-500' },
              { label: 'กำลังดำเนินการ', pct: '10%', color: 'bg-blue-500' },
              { label: 'ยกเลิกแล้ว', pct: '10%', color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                <span className="text-gray-600">{item.label}</span>
                <span className="text-gray-400">({item.pct})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
