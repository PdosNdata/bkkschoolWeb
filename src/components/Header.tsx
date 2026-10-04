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
import { User as UserIcon, Menu, LayoutDashboard, Settings, LogOut } from "lucide-react";
import schoolLogo from "@/assets/school-logo-optimized.webp";
// Raised glass items: lift + glossy purple fill when highlighted (hover/keyboard)
const MENU_ITEM =
  "group cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-semibold text-gray-800 transition-all duration-200 focus:-translate-y-px focus:bg-gradient-to-b focus:from-purple-500 focus:to-purple-700 focus:text-white focus:shadow-[0_6px_14px_rgba(126,34,206,0.4),inset_0_1px_0_rgba(255,255,255,0.4)]";
const MENU_ICON =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors group-focus:bg-white/25 group-focus:text-white";

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
  { name: "หน้าแรก", href: "/", id: null },
  { name: "ประวัติโรงเรียน", href: "/#history", id: "history" },
  { name: "กิจกรรมภายใน", href: "/#activities", id: "activities" },
  { name: "ข่าวสาร", href: "/#news", id: "news" },
  { name: "คลังสื่อออนไลน์", href: "/#media", id: "media" },
  { name: "ติดต่อเรา", href: "/#contact", id: "contact" },
];

const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string | null) => {
  if (!id) {
    // หน้าแรก - scroll to top
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }
  
  if (location.pathname === "/") {
    // อยู่ในหน้าแรกอยู่แล้ว - แค่ scroll
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } else {
    // อยู่หน้าอื่น - ต้องไปหน้าแรกก่อนแล้วค่อย scroll
    e.preventDefault();
    navigate("/");
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }
};

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
    <header className="sticky top-0 z-50 border-b border-white/50 bg-gradient-to-b from-white/75 via-white/55 to-white/40 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(88,28,135,0.14),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.6)]">
      {/* glass specular highlight along the top edge */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-2 min-h-16 py-2">
          {/* Logo + Title - clickable to home */}
          <Link
            to="/"
            onClick={(e) => handleMenuClick(e, null)}
            className="flex items-center space-x-2 min-w-0 rounded-xl px-2 py-1 -ml-2 cursor-pointer transition-all duration-300 hover:bg-purple-200/50 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_3px_10px_rgba(126,34,206,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            <img
              src={schoolLogo}
              alt="โลโก้โรงเรียน บ้านค้อดอนแคน"
              className="w-auto h-8 shrink-0 transition-transform duration-300 hover:scale-105"
              width="32"
              height="32"
              loading="eager"
              sizes="32px"
              style={{ maxWidth: '32px', height: 'auto' }}
            />
            {/* On tablets (md) the glass nav needs the room, so only the logo shows */}
            <div className="flex flex-col min-w-0 md:hidden lg:flex">
              <span className="font-bold text-primary text-sm sm:text-lg leading-tight transition-colors duration-300">โรงเรียนบ้านค้อดอนแคน</span>
              <span className="hidden sm:block text-xs text-muted-foreground">Ban Kho Don Khaen School</span>
            </div>
          </Link>

          {(isHome || !userName) && (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 rounded-full border border-white/70 bg-white/35 p-1.5 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_5px_rgba(88,28,135,0.10),0_4px_14px_rgba(88,28,135,0.12)]">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={(e) => handleMenuClick(e, item.id)}
                    className="whitespace-nowrap rounded-full px-3 lg:px-4 py-2 text-sm lg:text-base font-semibold text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gradient-to-b hover:from-purple-500 hover:to-purple-700 hover:text-white hover:shadow-[0_6px_14px_rgba(126,34,206,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
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
                    className="md:hidden rounded-full border border-white/70 bg-white/40 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_3px_10px_rgba(88,28,135,0.15)]"
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
                        onClick={(e) => {
                          handleMenuClick(e, item.id);
                          setIsMobileMenuOpen(false);
                        }}
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
                  <Button variant="ghost" className="font-medium flex items-center gap-2 rounded-full border border-white/70 bg-white/40 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_3px_10px_rgba(88,28,135,0.15)] transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-300 hover:bg-gradient-to-b hover:from-purple-500 hover:to-purple-700 hover:text-white hover:shadow-[0_6px_14px_rgba(126,34,206,0.45),inset_0_1px_0_rgba(255,255,255,0.45)] data-[state=open]:bg-gradient-to-b data-[state=open]:from-purple-500 data-[state=open]:to-purple-700 data-[state=open]:text-white focus-visible:ring-purple-500">
                    <span>{userName}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl ?? undefined} alt={`โปรไฟล์ของ ${userName ?? ''}`} loading="lazy" />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-56 overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-b from-white/90 to-purple-50/80 p-1.5 backdrop-blur-xl backdrop-saturate-150 shadow-[0_18px_44px_rgba(88,28,135,0.28),0_2px_6px_rgba(88,28,135,0.12),inset_0_1px_0_rgba(255,255,255,1),inset_0_-2px_6px_rgba(88,28,135,0.08)]"
                >
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard")}
                    className={MENU_ITEM}
                  >
                    <span className={MENU_ICON}><LayoutDashboard className="h-4 w-4" /></span>
                    แดชบอร์ด
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className={MENU_ITEM}>
                    <span className={MENU_ICON}><Settings className="h-4 w-4" /></span>
                    ตั้งค่า
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-2 my-1.5 bg-gradient-to-r from-transparent via-purple-300/70 to-transparent" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className={`${MENU_ITEM} text-red-600 focus:from-red-500 focus:to-rose-600 focus:shadow-[0_6px_14px_rgba(225,29,72,0.4),inset_0_1px_0_rgba(255,255,255,0.4)]`}
                  >
                    <span className={`${MENU_ICON} bg-red-100 text-red-600 group-focus:bg-white/25 group-focus:text-white`}><LogOut className="h-4 w-4" /></span>
                    ลงชื่อออก
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" className="rounded-full shadow-[0_4px_14px_rgba(126,34,206,0.35),inset_0_1px_0_rgba(255,255,255,0.4)] hover:-translate-y-0.5 transition-all" onClick={() => setIsAuthModalOpen(true)}>
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
