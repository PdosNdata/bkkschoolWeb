export default function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold">
            เริ่มต้นใช้งานระบบ <span className="text-blue-600">Education Book System</span> วันนี้
          </h2>
          <p className="mt-4 text-gray-600">
            ยกระดับการบริหารจัดการหนังสือเรียนให้มีประสิทธิภาพ โปร่งใส และตรวจสอบได้
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button className="btn-primary">ลงชื่อเข้าใช้งาน</button>
            <button className="btn-outline">ติดต่อฝ่ายบริการลูกค้า</button>
          </div>
        </div>
      </div>
    </section>
  )
}