import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthModal from "./AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import Swal from "sweetalert2";
import UserSettingsModal from "./UserSettingsModal";

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const menuItems = [
    { name: "หน้าแรก", href: "#home" },
    { name: "ประวัติโรงเรียน", href: "#history" },
    { name: "กิจกรรมภายใน", href: "#activities" },
    { name: "ข่าวสาร", href: "#news" },
    { name: "ติดต่อเรา", href: "#contact" },
  ];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) {
        // Load profile display name
        (async () => {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', uid)
              .maybeSingle();
            const name = data?.display_name?.trim();
            setUserName(name && name.length > 0 ? name : (session?.user?.email?.split('@')[0] ?? 'ผู้ใช้'));
          } catch {
            setUserName(session?.user?.email?.split('@')[0] ?? 'ผู้ใช้');
          }
        })();
      } else {
        setUserName(null);
      }
    });

    // Also fetch current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) {
        (async () => {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', uid)
              .maybeSingle();
            const name = data?.display_name?.trim();
            setUserName(name && name.length > 0 ? name : (session?.user?.email?.split('@')[0] ?? 'ผู้ใช้'));
          } catch {
            setUserName(session?.user?.email?.split('@')[0] ?? 'ผู้ใช้');
          }
        })();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'ออกจากระบบ?',
      text: 'คุณต้องการลงชื่อออกหรือไม่',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        await Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถออกจากระบบได้',
          text: error.message,
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true,
        });
        return;
      }
      await Swal.fire({
        icon: 'success',
        title: 'ออกจากระบบสำเร็จ',
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
      });
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-elegant">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Title - clickable to home */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="https://i.postimg.cc/y8Y4TXJY/1.png"
              alt="โลโก้โรงเรียน บ้านค้อดอนแคน"
              className="w-auto h-8"
            />
            <div className="flex flex-col">
              <span className="font-bold text-primary text-lg">โรงเรียนบ้านค้อดอนแคน</span>
              <span className="text-xs text-muted-foreground">Ban Kho Don Khaen School</span>
            </div>
          </Link>

          {(isHome || !userName) && (
            <nav className="hidden md:flex space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:bg-purple-600 hover:text-white transition-all duration-300 font-medium px-3 py-2 rounded-md"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          )}

          {/* Right side: user menu or login button */}
          <div className="flex items-center">
            {userName ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="font-medium">
                    {userName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    ตั้งค่า
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    ลงชื่อออก
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" onClick={() => setIsAuthModalOpen(true)}>
                เข้าสู่ระบบ
              </Button>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {userId && (
        <UserSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      )}
    </header>
  );
};
export default Header;
