import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { supabase } from "@/integrations/supabase/client";
import { STUDENT_MENU_ITEMS } from "@/lib/studentMenu";

const ICONS = { attendance_system: BookOpen, student_affairs: GraduationCap } as const;

/** เมนู "นักเรียน": รวมระบบตรวจการมาเรียนและระบบกิจการนักเรียน (แสดงเฉพาะที่บัญชีนี้มีสิทธิ์) */
const StudentMenuPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [perms, setPerms] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const safety = setTimeout(() => { if (!cancelled) setLoading(false); }, 8000);
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) { navigate("/"); return; }
        const [rolesRes, permsRes] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", userId).eq("approved", true),
          supabase.from("user_permissions").select("permission_name").eq("user_id", userId).eq("granted", true),
        ]);
        if (cancelled) return;
        setIsAdmin((rolesRes.data ?? []).some((r) => r.role === "admin"));
        setPerms((permsRes.data ?? []).map((p) => p.permission_name));
      } catch (e) {
        console.error("Error loading student menu:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; clearTimeout(safety); };
  }, [navigate]);

  const items = STUDENT_MENU_ITEMS.filter((i) => isAdmin || perms.includes(i.permissionName));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" />กลับหน้าระบบจัดการโรงเรียน</Link>
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-primary">นักเรียน</h1>
          <p className="text-lg text-muted-foreground">ระบบตรวจการมาเรียน และระบบกิจการนักเรียน</p>
        </div>
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">กำลังโหลด...</div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">บัญชีนี้ยังไม่มีสิทธิ์ใช้เมนูในหมวดนักเรียน — ติดต่อผู้ดูแลระบบ</p>
        ) : (
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            {items.map((i, idx) => (
              <DashboardCard key={i.permissionName} index={idx} title={i.title} description={i.description}
                icon={ICONS[i.permissionName as keyof typeof ICONS]} themeKey={i.permissionName} href={i.href} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StudentMenuPage;
