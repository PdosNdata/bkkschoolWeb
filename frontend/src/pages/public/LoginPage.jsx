import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import { User, Lock, Eye } from 'lucide-react'
import Swal from 'sweetalert2'


<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
></motion.div>
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    password: '',
    remember: false,
  })
  const [errors, setErrors] = useState({})
  const validate = (name, value) => {
    let message = ''
  
    if (name === 'username') {
      if (!value) message = 'กรุณากรอกชื่อผู้ใช้หรือเลขประจำตัวครู'
      else if (value.length < 4) message = 'ต้องมีอย่างน้อย 4 ตัวอักษร'
    }
  
    if (name === 'password') {
      if (!value) message = 'กรุณากรอกรหัสผ่าน'
      else if (value.length < 6) message = 'รหัสผ่านอย่างน้อย 6 ตัว'
    }
  
    setErrors(prev => ({ ...prev, [name]: message }))
  }
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    validate(name, value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(form.username, form.password)

    setLoading(false)

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ!',
        text: 'ยินดีต้อนรับเข้าสู่ระบบ',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#16a34a',
        timer: 1500,
        timerProgressBar: true,
      }).then(() => {
        navigate('/dashboard')
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: result.message,
        confirmButtonText: 'ลองใหม่',
        confirmButtonColor: '#dc2626',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">
        
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-blue-50">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                📘
              </div>
              <span className="font-semibold text-lg">
                Education Book System
              </span>
            </div>

            <h2 className="text-3xl font-bold mb-4">
              ระบบบริหารจัดการหนังสือเรียน<br />โรงเรียนบ้านค้อดอนแคน
            </h2>

            <p className="text-gray-600 leading-relaxed">
              ระบบสำหรับครูประจำชั้นเพื่ออำนวยความสะดวกในการสำรวจและสั่งหนังสือเรียน
              สำหรับนักเรียนระดับอนุบาลถึงมัธยมศึกษาปีที่ 3
            </p>
          </div>

          <div className="flex gap-4 text-sm text-blue-600 mt-8">
            <span>✔ รวดเร็ว</span>
            <span>✔ แม่นยำ</span>
            <span>✔ ตรวจสอบได้</span>
          </div>
        </div>

        {/* Right panel (Login Form) */}
        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-2">เข้าสู่ระบบ</h2>
          <p className="text-gray-500 mb-6">
            กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="กรอกชื่อผู้ใช้ หรือ อีเมล"
                required
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">รหัสผ่าน</label>
                <button
                  type="button"
                  className="text-sm text-blue-600"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="กรอกรหัสผ่าน"
                  required
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              <span>จดจำการเข้าสู่ระบบ</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-500">
              ยังไม่มีบัญชี?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                สมัครสมาชิก
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              ติดปัญหาการใช้งาน?{' '}
              <span className="text-blue-600 cursor-pointer">
                ติดต่อฝ่ายสนับสนุน
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-xs text-gray-400">
        © 2024 Textbook Ordering System. All rights reserved.
      </div>
    </div>
  )
}