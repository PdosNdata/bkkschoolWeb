import { MapPin, Phone, Mail, Facebook, MessageCircle } from "lucide-react";
const Footer = () => {
  return <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">บ</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">โรงเรียนบ้านค้อดอนแคน</h3>
              </div>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              แหล่งเรียนรู้และพัฒนาการศึกษาในท้องถิ่น 
              มุ่งเน้นการปลูกฝังคุณธรรม จริยธรรม และความรู้ที่ทันสมัย
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">เมนูหลัก</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-primary-foreground/80 hover:text-white transition-colors duration-300">
                  หน้าแรก
                </a>
              </li>
              <li>
                <a href="#history" className="text-primary-foreground/80 hover:text-white transition-colors duration-300">
                  ประวัติโรงเรียน
                </a>
              </li>
              <li>
                <a href="#activities" className="text-primary-foreground/80 hover:text-white transition-colors duration-300">
                  กิจกรรมภายใน
                </a>
              </li>
              <li>
                <a href="#news" className="text-primary-foreground/80 hover:text-white transition-colors duration-300">
                  ข่าวสาร
                </a>
              </li>
              <li>
                <a href="#contact" className="text-primary-foreground/80 hover:text-white transition-colors duration-300">
                  ติดต่อเรา
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">ติดต่อเรา</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">93 หมู่ที่ 3 ตำบลค้อใหญ่ อำเภอกู่แก้ว จังหวัดอุดรธานี 41130</span>
              </li>
              <li className="flex items-center space-x-2">
                
                
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">41030208@bankhodonkhaen.ac.th</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold text-lg mb-4">ติดตามเรา</h4>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors duration-300">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
            <p className="text-primary-foreground/80 text-sm mt-4">
              เวลาทำการ: จันทร์ - ศุกร์<br />
              08.00 - 16.30 น.
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm">© 2025 โรงเรียนบ้านค้อดอนแคน สงวนลิขสิทธิ์</p>
        </div>
      </div>
    </footer>;
};
export default Footer;