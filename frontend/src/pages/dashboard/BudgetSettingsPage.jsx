import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Edit3, Trash2, Wallet, Loader2, Save, Users, Calculator } from 'lucide-react'
import Swal from 'sweetalert2'

const gradeLabel = { kg2: 'อนุบาล 2', kg3: 'อนุบาล 3', p1: 'ป.1', p2: 'ป.2', p3: 'ป.3', p4: 'ป.4', p5: 'ป.5', p6: 'ป.6', m1: 'ม.1', m2: 'ม.2', m3: 'ม.3' }
const levelLabel = { kindergarten: 'อนุบาล', primary: 'ประถมศึกษา', secondary: 'มัธยมศึกษา' }
const gradesByLevel = {
  kindergarten: ['kg2', 'kg3'],
  primary: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
  secondary: ['m1', 'm2', 'm3'],
}

export default function BudgetSettingsPage() {
  const [budgets, setBudgets] = useState([])
  const [studentCounts, setStudentCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + 543)
  const [form, setForm] = useState({ year: selectedYear, level: 'primary', grade: 'p1', per_head: '', amount: '' })

  useEffect(() => { fetchData() }, [selectedYear])

  const fetchData = async () => {
    setLoading(true)
    const [budgetRes, studentRes] = await Promise.all([
      supabase.from('budgets').select('*').eq('year', selectedYear).order('grade', { ascending: true }),
      supabase.from('students').select('grade')
    ])

    setBudgets(budgetRes.data || [])

    // นับจำนวนนักเรียนแต่ละชั้น
    const counts = {}
    ;(studentRes.data || []).forEach(s => {
      counts[s.grade] = (counts[s.grade] || 0) + 1
    })
    setStudentCounts(counts)
    setLoading(false)
  }

  const openAdd = () => {
    setEditItem(null)
    setForm({ year: selectedYear, level: 'primary', grade: 'p1', per_head: '', amount: '' })
    setShowModal(true)
  }

  const openEdit = (item) => {
    const count = studentCounts[item.grade] || 0
    const perHead = count > 0 ? Math.round(Number(item.amount) / count) : Number(item.amount)
    setEditItem(item)
    setForm({ year: item.year, level: item.level, grade: item.grade, per_head: perHead, amount: item.amount })
    setShowModal(true)
  }

  // คำนวณงบเมื่อเปลี่ยน per_head หรือ grade
  const updatePerHead = (perHead, grade) => {
    const count = studentCounts[grade] || 0
    const total = count > 0 ? Number(perHead) * count : Number(perHead)
    setForm(p => ({ ...p, per_head: perHead, amount: total }))
  }

  const handleSave = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      Swal.fire({ icon: 'warning', title: 'กรุณากรอกจำนวนเงิน', confirmButtonColor: '#2563eb' })
      return
    }
    const payload = { year: form.year, level: form.level, grade: form.grade, amount: Number(form.amount) }

    if (editItem) {
      const { error } = await supabase.from('budgets').update(payload).eq('id', editItem.id)
      if (error) { Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: error.message }); return }
      Swal.fire({ icon: 'success', title: 'แก้ไขสำเร็จ', timer: 1200, showConfirmButton: false })
    } else {
      const { error } = await supabase.from('budgets').insert(payload)
      if (error) {
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          Swal.fire({ icon: 'error', title: 'มีงบประมาณชั้นนี้แล้ว', text: 'ชั้นเรียนนี้มีงบประมาณอยู่แล้วในปีนี้' })
        } else {
          Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: error.message })
        }
        return
      }
      Swal.fire({ icon: 'success', title: 'เพิ่มสำเร็จ', timer: 1200, showConfirmButton: false })
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id, grade) => {
    const result = await Swal.fire({ title: `ลบงบประมาณ "${gradeLabel[grade]}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#dc2626' })
    if (!result.isConfirmed) return
    await supabase.from('budgets').delete().eq('id', id)
    Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1200, showConfirmButton: false })
    fetchData()
  }

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0)
  const totalUsed = budgets.reduce((sum, b) => sum + Number(b.used_amount || 0), 0)
  const totalStudents = Object.values(studentCounts).reduce((sum, c) => sum + c, 0)
  const usedPct = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0

  // จัดกลุ่มตามระดับ
  const grouped = { kindergarten: [], primary: [], secondary: [] }
  budgets.forEach(b => { if (grouped[b.level]) grouped[b.level].push(b) })

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /><span className="ml-3 text-gray-500">กำลังโหลด...</span></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">การตั้งค่างบประมาณ</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการงบประมาณหนังสือเรียนตามระดับชั้น (คำนวณรายหัวนักเรียน)</p>
        </div>
        <div className="flex gap-3">
          <select className="border rounded-xl px-4 py-2.5 text-sm" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
            {[0, -1, -2, 1].map(d => { const y = new Date().getFullYear() + 543 + d; return <option key={y} value={y}>{y}</option> })}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700">
            <Plus size={16} /> เพิ่มงบประมาณ
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">งบประมาณทั้งหมด</p>
          <p className="text-2xl font-bold mt-1">฿{totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">ใช้ไปแล้ว</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">฿{totalUsed.toLocaleString()}</p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${usedPct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{usedPct}% ของงบประมาณ</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">คงเหลือ</p>
          <p className="text-2xl font-bold mt-1 text-green-600">฿{(totalBudget - totalUsed).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-purple-600" />
            <p className="text-sm text-gray-500">นักเรียนทั้งหมด</p>
          </div>
          <p className="text-2xl font-bold mt-1 text-purple-600">{totalStudents.toLocaleString()} คน</p>
          {totalStudents > 0 && totalBudget > 0 && (
            <p className="text-xs text-gray-400 mt-1">เฉลี่ย ฿{Math.round(totalBudget / totalStudents).toLocaleString()}/คน</p>
          )}
        </div>
      </div>

      {/* Budget by Level */}
      {Object.entries(grouped).map(([level, items]) => {
        const levelGrades = gradesByLevel[level]
        const levelStudents = levelGrades.reduce((sum, g) => sum + (studentCounts[g] || 0), 0)

        return (
          <div key={level} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Wallet size={20} className="text-blue-600" />
                {levelLabel[level]}
              </h3>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Users size={14} /> {levelStudents} คน
              </span>
            </div>
            {items.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีข้อมูลงบประมาณ</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium">ระดับชั้น</th>
                      <th className="text-right px-4 py-3 font-medium">จำนวนนักเรียน</th>
                      <th className="text-right px-4 py-3 font-medium">งบ/คน (บาท)</th>
                      <th className="text-right px-4 py-3 font-medium">งบประมาณรวม (บาท)</th>
                      <th className="text-right px-4 py-3 font-medium">ใช้ไปแล้ว</th>
                      <th className="text-right px-4 py-3 font-medium">คงเหลือ</th>
                      <th className="text-center px-4 py-3 font-medium">%</th>
                      <th className="text-center px-4 py-3 font-medium">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map(b => {
                      const used = Number(b.used_amount || 0)
                      const amount = Number(b.amount)
                      const count = studentCounts[b.grade] || 0
                      const perHead = count > 0 ? Math.round(amount / count) : '-'
                      const pct = amount > 0 ? Math.round((used / amount) * 100) : 0
                      return (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{gradeLabel[b.grade]}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center gap-1 text-purple-600">
                              <Users size={13} /> {count} คน
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-orange-600 font-medium">
                            {perHead === '-' ? '-' : `฿${perHead.toLocaleString()}`}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">฿{amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-blue-600">฿{used.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-green-600">฿{(amount - used).toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-16 bg-gray-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${pct > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} /></div>
                              <span className="text-xs text-gray-500">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openEdit(b)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={15} /></button>
                              <button onClick={() => handleDelete(b.id, b.grade)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-bold mb-4">{editItem ? 'แก้ไขงบประมาณ' : 'เพิ่มงบประมาณใหม่'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">ปีการศึกษา</label>
                <input type="number" className="input-field mt-1" value={form.year} onChange={e => setForm(p => ({...p, year: Number(e.target.value)}))} />
              </div>
              <div>
                <label className="text-sm font-medium">ระดับการศึกษา</label>
                <select className="input-field mt-1" value={form.level} onChange={e => { const lv = e.target.value; const g = gradesByLevel[lv][0]; setForm(p => ({...p, level: lv, grade: g, per_head: '', amount: ''})) }}>
                  {Object.entries(levelLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">ระดับชั้น</label>
                <select className="input-field mt-1" value={form.grade} onChange={e => { const g = e.target.value; setForm(p => ({...p, grade: g})); if (form.per_head) updatePerHead(form.per_head, g) }}>
                  {(gradesByLevel[form.level] || []).map(g => <option key={g} value={g}>{gradeLabel[g]} ({studentCounts[g] || 0} คน)</option>)}
                </select>
              </div>

              {/* จำนวนนักเรียนในชั้นที่เลือก */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-3">
                <Users size={18} className="text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-700">นักเรียนชั้น {gradeLabel[form.grade]}</p>
                  <p className="text-lg font-bold text-purple-600">{studentCounts[form.grade] || 0} คน</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calculator size={14} /> งบประมาณต่อหัว (บาท/คน)
                </label>
                <input
                  type="number"
                  className="input-field mt-1"
                  placeholder="เช่น 500"
                  value={form.per_head}
                  onChange={e => updatePerHead(e.target.value, form.grade)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">งบประมาณรวม (บาท)</label>
                <input
                  type="number"
                  className="input-field mt-1"
                  placeholder="เช่น 50000"
                  value={form.amount}
                  onChange={e => setForm(p => ({...p, amount: e.target.value, per_head: ''}))}
                />
                {form.per_head && (studentCounts[form.grade] || 0) > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    = ฿{Number(form.per_head).toLocaleString()} × {studentCounts[form.grade]} คน = ฿{Number(form.amount).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 flex items-center gap-2"><Save size={16} /> บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
