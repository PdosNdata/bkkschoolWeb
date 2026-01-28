const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        {/* School Info */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold mb-2">โรงเรียนบ้านค้อดอนแคน</h3>
          <p className="text-sm text-gray-300">ระบบสั่งหนังสือเรียน</p>
        </div>
        
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Email */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xl">📧</span>
            <a 
              href="mailto:41030208@udonthani3.go.th" 
              className="text-sm hover:text-blue-400 transition-colors"
            >
              41030208@udonthani3.go.th
            </a>
          </div>
          
          {/* Phone */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xl">📞</span>
            <a 
              href="tel:0895598439" 
              className="text-sm hover:text-blue-400 transition-colors"
            >
              089-559-8439
            </a>
          </div>
          
          {/* Address */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xl">📍</span>
            <p className="text-sm text-gray-300">
              93 หมู่ 3 ตำบลค้อใหญ่ อำเภอกเขตภูมาหัส จังหวัด อุดรธานี 41130
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center pt-4 border-t border-gray-700">
          <p className="text-sm">
            © {currentYear} โรงเรียนบ้านค้อดอนแคน | ระบบสั่งหนังสือเรียน
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;