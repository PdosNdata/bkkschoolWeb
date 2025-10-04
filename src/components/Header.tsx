import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthModal from "./AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import Swal from "sweetalert2";
import UserSettingsModal from "./UserSettingsModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Menu } from "lucide-react";
import schoolLogo from "@/assets/school-logo-optimized.webp";
const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
const menuItems = [
  { name: "หน้าแรก", href: "/" },
  { name: "ประวัติโรงเรียน", href: "/#history" },
  { name: "กิจกรรมภายใน", href: "/#activities" },
  { name: "ข่าวสาร", href: "/#news" },
  { name: "คลังสื่อออนไลน์", href: "/#media" },
  { name: "ติดต่อเรา", href: "/#contact" },
];

const fetchProfile = async (uid: string, emailFallback?: string | null) => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', uid)
      .maybeSingle();
    const name = data?.display_name?.trim();
    setUserName(name && name.length > 0 ? name : (emailFallback?.split('@')[0] ?? 'ผู้ใช้'));
    setAvatarUrl(data?.avatar_url ?? null);
  } catch {
    setUserName(emailFallback?.split('@')[0] ?? 'ผู้ใช้');
    setAvatarUrl(null);
  }
};

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) {
        fetchProfile(uid, session?.user?.email ?? null);
      } else {
        setUserName(null);
        setAvatarUrl(null);
      }
    });

    // Also fetch current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) {
        fetchProfile(uid, session?.user?.email ?? null);
      } else {
        setUserName(null);
        setAvatarUrl(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSettingsOpen && userId) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        fetchProfile(userId, session?.user?.email ?? null);
      });
    }
  }, [isSettingsOpen, userId]);

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
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300 cursor-pointer">
            <img
              src={schoolLogo}
              alt="โลโก้โรงเรียน บ้านค้อดอนแคน"
              className="w-auto h-8 transition-transform duration-300 hover:scale-105"
              width="32"
              height="32"
              loading="eager"
              fetchPriority="high"
              sizes="32px"
              style={{ maxWidth: '32px', height: 'auto' }}
            />
            <div className="flex flex-col">
              <span className="font-bold text-primary text-lg hover:text-primary-glow transition-colors duration-300">โรงเรียนบ้านค้อดอนแคน</span>
              <span className="text-xs text-muted-foreground">Ban Kho Don Khaen School</span>
            </div>
          </Link>

          {(isHome || !userName) && (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-foreground hover:bg-purple-600 hover:text-white transition-all duration-300 font-medium px-3 py-2 rounded-md"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Hamburger Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="md:hidden"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">เมนู</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <nav className="flex flex-col space-y-4 mt-8">
                    {menuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-foreground hover:bg-purple-600 hover:text-white transition-all duration-300 font-medium px-4 py-3 rounded-md text-left"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          )}

          {/* Right side: user menu or login button */}
          <div className="flex items-center">
            {userName ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="font-medium flex items-center gap-2">
                    <span>{userName}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl ?? undefined} alt={`โปรไฟล์ของ ${userName ?? ''}`} loading="lazy" />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
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
