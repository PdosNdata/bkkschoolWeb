import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import AuthModal from "./AuthModal";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const menuItems = [{
    name: "หน้าแรก",
    href: "#home"
  }, {
    name: "ประวัติโรงเรียน",
    href: "#history"
  }, {
    name: "กิจกรรมภายใน",
    href: "#activities"
  }, {
    name: "ข่าวสาร",
    href: "#news"
  }, {
    name: "ติดต่อเรา",
    href: "#contact"
  }];
  return <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-elegant">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src="https://i.postimg.cc/y8Y4TXJY/1.png" 
              alt="โลโก้โรงเรียน" 
              className="w-auto h-8"
            />
            <div className="flex flex-col">
              <span className="font-bold text-primary text-lg">โรงเรียนบ้านค้อดอนแคน</span>
              <span className="text-xs text-muted-foreground">Ban Kho Don Khaen School</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map(item => 
              <a 
                key={item.name} 
                href={item.href} 
                className="text-foreground hover:bg-purple-600 hover:text-white transition-all duration-300 font-medium px-3 py-2 rounded-md"
              >
                {item.name}
              </a>
            )}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button variant="default" size="sm" onClick={() => setIsAuthModalOpen(true)}>
              เข้าสู่ระบบ
            </Button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden py-6 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {menuItems.map(item => 
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="text-foreground hover:bg-purple-600 hover:text-white transition-all duration-300 font-medium py-2 px-3 rounded-md" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              )}
              <Button variant="default" size="sm" className="w-fit" onClick={() => setIsAuthModalOpen(true)}>
                เข้าสู่ระบบ
              </Button>
            </nav>
          </div>}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>;
};
export default Header;