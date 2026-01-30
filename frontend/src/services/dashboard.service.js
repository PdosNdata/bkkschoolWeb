import { supabase } from '../lib/supabase'

// ดึงสถิติสำหรับ Admin/Staff Dashboard
export const getDashboardStats = async (year) => {
  const currentYear = year || new Date().getFullYear() + 543 // ปี พ.ศ.

  // ดึงข้อมูลพร้อมกัน
  const [ordersRes, budgetsRes, usersRes] = await Promise.all([
    supabase.from('orders').select('id, status, total_amount, created_at').eq('year', currentYear),
    supabase.from('budgets').select('amount, used_amount').eq('year', currentYear),
    supabase.from('users').select('id, role'),
  ])

  const orders = ordersRes.data || []
  const budgets = budgetsRes.data || []
  const users = usersRes.data || []

  // นับคำสั่งซื้อตามสถานะ
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const approvedOrders = orders.filter(o => o.status === 'approved' || o.status === 'completed').length
  const shippingOrders = orders.filter(o => o.status === 'shipping').length
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length
  const totalOrders = orders.length

  // งบประมาณ
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0)
  const usedBudget = budgets.reduce((sum, b) => sum + Number(b.used_amount || 0), 0)
  const budgetPercentage = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0

  // นับจำนวนครู (ใช้เป็นตัวแทนนักเรียน ถ้ายังไม่มีตาราง students)
  const teacherCount = users.filter(u => u.role === 'teacher').length
  const totalUsers = users.length

  return {
    pendingOrders,
    approvedOrders,
    shippingOrders,
    cancelledOrders,
    totalOrders,
    totalBudget,
    usedBudget,
    budgetPercentage,
    teacherCount,
    totalUsers,
  }
}

// ดึงข้อมูลแนวโน้มคำสั่งซื้อรายเดือน
export const getOrderTrends = async (year, months = 6) => {
  const currentYear = year || new Date().getFullYear() + 543

  const { data: orders } = await supabase
    .from('orders')
    .select('created_at')
    .eq('year', currentYear)
    .order('created_at', { ascending: true })

  // จัดกลุ่มตามเดือน
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  const now = new Date()
  const labels = []
  const data = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthIndex = d.getMonth()
    const yearNum = d.getFullYear()
    labels.push(monthNames[monthIndex])

    const count = (orders || []).filter(o => {
      const created = new Date(o.created_at)
      return created.getMonth() === monthIndex && created.getFullYear() === yearNum
    }).length

    data.push(count)
  }

  return { labels, data }
}

// ดึงข้อมูลการกระจายสถานะคำสั่งซื้อ
export const getOrderStatusDistribution = async (year) => {
  const currentYear = year || new Date().getFullYear() + 543

  const { data: orders } = await supabase
    .from('orders')
    .select('status')
    .eq('year', currentYear)

  const allOrders = orders || []
  const total = allOrders.length

  const approved = allOrders.filter(o => o.status === 'approved' || o.status === 'completed').length
  const pending = allOrders.filter(o => o.status === 'pending').length
  const shipping = allOrders.filter(o => o.status === 'shipping').length
  const cancelled = allOrders.filter(o => o.status === 'cancelled').length

  return {
    total,
    data: [approved, pending, shipping, cancelled],
    percentages: total > 0
      ? [
          Math.round((approved / total) * 100),
          Math.round((pending / total) * 100),
          Math.round((shipping / total) * 100),
          Math.round((cancelled / total) * 100),
        ]
      : [0, 0, 0, 0],
  }
}

// ดึงการแจ้งเตือนที่ยังไม่ได้อ่าน
export const getUnreadNotifications = async (userId) => {
  const { data, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(10)

  return { notifications: data || [], count: count || 0 }
}

// ดึงคำสั่งซื้อสำหรับครู
export const getTeacherOrders = async (teacherId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching teacher orders:', error)
    return []
  }

  return data || []
}

// ฟอร์แมตจำนวนเงิน
export const formatCurrency = (amount) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M บาท`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K บาท`
  }
  return `${amount.toLocaleString()} บาท`
}
