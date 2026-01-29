import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, Plus, Edit3, Trash2, Upload, Download, Users, Loader2, GraduationCap } from 'lucide-react'
import Swal from 'sweetalert2'

const PAGE_SIZE = 15

const gradeLabel = { kg2: 'อนุบาล 2', kg3: 'อนุบาล 3', p1: 'ป.1', p2: 'ป.2', p3: 'ป.3', p4: 'ป.4', p5: 'ป.5', p6: 'ป.6', m1: 'ม.1', m2: 'ม.2', m3: 'ม.3' }
const gradeOptions = ['kg2','kg3','p1','p2','p3','p4','p5','p6','m1','m2','m3']

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ student_id: '', first_name: '', last_name: '', grade: 'p1' })
  const [csvUploading, setCsvUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('students')
      .select('*')
      .order('grade')
      .order('student_id')
    setStudents(data || [])
    setLoading(false)
  }

  const openAdd = () => {
    setEditItem(null)
    setForm({ student_id: '', first_name: '', last_name: '', grade: 'p1' })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ student_id: item.student_id, first_name: item.first_name, last_name: item.last_name, grade: item.grade })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.student_id || !form.first_name || !form.last_name) {
      Swal.fire({ icon: 'warning', title: 'กรุณากรอกข้อมูลให้ครบ', text: 'รหัสนักเรียน, ชื่อ และนามสกุล จำเป็นต้องกรอก', confirmButtonColor: '#2563eb' })
      return
    }

    if (editItem) {
      const { error } = await supabase.from('students').update(form).eq('id', editItem.id)
      if (error) { Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: error.message }); return }
      Swal.fire({ icon: 'success', title: 'แก้ไขสำเร็จ', timer: 1200, showConfirmButton: false })
    } else {
      const { error } = await supabase.from('students').insert(form)
      if (error) {
        if (error.code === '23505') {
          Swal.fire({ icon: 'error', title: 'รหัสนักเรียนซ้ำ', text: `รหัส ${form.student_id} มีอยู่ในระบบแล้ว` })
        } else {
          Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: error.message })
        }
        return
      }
      Swal.fire({ icon: 'success', title: 'เพิ่มสำเร็จ', timer: 1200, showConfirmButton: false })
    }
    setShowModal(false)
    fetchStudents()
  }

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({ title: `ลบ "${name}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#dc2626' })
    if (!result.isConfirmed) return
    await supabase.from('students').delete().eq('id', id)
    Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', timer: 1200, showConfirmButton: false })
    fetchStudents()
  }

  // --- CSV Upload ---
  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvUploading(true)

    const text = await file.text()
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) {
      Swal.fire({ icon: 'warning', title: 'ไฟล์ CSV ไม่ถูกต้อง', text: 'ต้องมีหัวตารางและข้อมูลอย่างน้อย 1 แถว', confirmButtonColor: '#2563eb' })
      setCsvUploading(false)
      fileInputRef.current.value = ''
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
    const requiredCols = ['student_id', 'first_name', 'last_name', 'grade']
    const missing = requiredCols.filter(c => !headers.includes(c))
    if (missing.length > 0) {
      Swal.fire({ icon: 'error', title: 'คอลัมน์ไม่ครบ', text: `ต้องมีคอลัมน์: ${requiredCols.join(', ')}`, confirmButtonColor: '#2563eb' })
      setCsvUploading(false)
      fileInputRef.current.value = ''
      return
    }

    const rows = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row = {}
      headers.forEach((h, idx) => { row[h] = values[idx] || '' })
      if (!row.student_id || !row.first_name || !row.last_name || !row.grade) continue
      rows.push({
        student_id: row.student_id,
        first_name: row.first_name,
        last_name: row.last_name,
        grade: row.grade
      })
    }

    if (rows.length === 0) {
      Swal.fire({ icon: 'warning', title: 'ไม่มีข้อมูล', text: 'ไม่พบแถวข้อมูลที่ถูกต้อง', confirmButtonColor: '#2563eb' })
      setCsvUploading(false)
      fileInputRef.current.value = ''
      return
    }

    const { error } = await supabase.from('students').upsert(rows, { onConflict: 'student_id' })
    if (error) {
      Swal.fire({ icon: 'error', title: 'อัพโหลดผิดพลาด', text: error.message })
    } else {
      Swal.fire({ icon: 'success', title: 'นำเข้าสำเร็จ', text: `เพิ่ม/อัพเดทนักเรียน ${rows.length} คน`, timer: 2000, showConfirmButton: false })
      fetchStudents()
    }
    setCsvUploading(false)
    fileInputRef.current.value = ''
  }

  // --- CSV Export ---
  const exportCsv = () => {
    const csvHeaders = ['student_id', 'first_name', 'last_name', 'grade']
    const csvRows = filtered.map(s => [
      s.student_id,
      `"${(s.first_name || '').replace(/"/g, '""')}"`,
      `"${(s.last_name || '').replace(/"/g, '""')}"`,
      s.grade
    ])
    const csvContent = [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = students.filter(s => {
    const matchSearch = (s.student_id + ' ' + s.first_name + ' ' + s.last_name).toLowerCase().includes(search.toLowerCase())
    const matchGrade = !filterGrade || s.grade === filterGrade
    return matchSearch && matchGrade
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Grade stats
  const gradeStats = {}
  students.forEach(s => { gradeStats[s.grade] = (gradeStats[s.grade] || 0) + 1 })

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /><span className="ml-3 text-gray-500">กำลังโหลด...</span></div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ข้อมูลนักเรียน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการข้อมูลนักเรียนทั้งหมด ({students.length} คน)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCsvUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={csvUploading} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 disabled:opacity-50">
            {csvUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} นำเข้า CSV
          </button>
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
            <Download size={16} /> ส่งออก CSV
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700">
            <Plus size={16} /> เพิ่มนักเรียน
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50"><Users size={24} className="text-blue-600" /></div>
          <div><p className="text-sm text-gray-500">นักเรียนทั้งหมด</p><p className="text-2xl font-bold">{students.length}</p></div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50"><GraduationCap size={24} className="text-purple-600" /></div>
          <div><p className="text-sm text-gray-500">อนุบาล</p><p className="text-2xl font-bold">{(gradeStats.kg2 || 0) + (gradeStats.kg3 || 0)}</p></div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50"><GraduationCap size={24} className="text-green-600" /></div>
          <div><p className="text-sm text-gray-500">ประถม</p><p className="text-2xl font-bold">{['p1','p2','p3','p4','p5','p6'].reduce((sum, g) => sum + (gradeStats[g] || 0), 0)}</p></div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50"><GraduationCap size={24} className="text-orange-600" /></div>
          <div><p className="text-sm text-gray-500">มัธยม</p><p className="text-2xl font-bold">{['m1','m2','m3'].reduce((sum, g) => sum + (gradeStats[g] || 0), 0)}</p></div>
        </div>
      </div>

      {/* CSV Format hint */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3">
        <p className="text-sm text-blue-700">
          <span className="font-medium">รูปแบบ CSV:</span> student_id, first_name, last_name, grade (เช่น p1, p2, m1, kg2)
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="ค้นหารหัส, ชื่อ, นามสกุล..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} />
          </div>
          <select className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setCurrentPage(1) }}>
            <option value="">ทุกชั้นเรียน</option>
            {gradeOptions.map(g => <option key={g} value={g}>{gradeLabel[g]}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-4 py-3 font-medium w-12">#</th>
                <th className="text-left px-4 py-3 font-medium">รหัสนักเรียน</th>
                <th className="text-left px-4 py-3 font-medium">ชื่อ</th>
                <th className="text-left px-4 py-3 font-medium">นามสกุล</th>
                <th className="text-left px-4 py-3 font-medium">ชั้นเรียน</th>
                <th className="text-center px-4 py-3 font-medium">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((s, idx) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-blue-700 font-medium">{s.student_id}</td>
                  <td className="px-4 py-3">{s.first_name}</td>
                  <td className="px-4 py-3">{s.last_name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {gradeLabel[s.grade] || s.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={15} /></button>
                      <button onClick={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
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
            <p className="text-sm text-gray-500">แสดง {(currentPage-1)*PAGE_SIZE+1} ถึง {Math.min(currentPage*PAGE_SIZE, filtered.length)} จาก {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40">ก่อนหน้า</button>
              {Array.from({length: totalPages}, (_, i) => i+1).slice(Math.max(0, currentPage-3), currentPage+2).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1.5 rounded-lg text-sm ${p === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}>{p}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40">ถัดไป</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-bold mb-4">{editItem ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">รหัสประจำตัวนักเรียน *</label>
                <input type="text" className="input-field mt-1" placeholder="เช่น 12345" value={form.student_id} onChange={e => setForm(p => ({...p, student_id: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">ชื่อ *</label>
                  <input type="text" className="input-field mt-1" value={form.first_name} onChange={e => setForm(p => ({...p, first_name: e.target.value}))} />
                </div>
                <div>
                  <label className="text-sm font-medium">นามสกุล *</label>
                  <input type="text" className="input-field mt-1" value={form.last_name} onChange={e => setForm(p => ({...p, last_name: e.target.value}))} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">ชั้นเรียน *</label>
                <select className="input-field mt-1" value={form.grade} onChange={e => setForm(p => ({...p, grade: e.target.value}))}>
                  {gradeOptions.map(g => <option key={g} value={g}>{gradeLabel[g]}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
