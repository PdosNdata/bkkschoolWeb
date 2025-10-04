import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActivityAllForm from "@/components/ActivityAllForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ActivityAllFormPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role, approved")
        .eq("user_id", user.id)
        .eq("approved", true)
        .single();

      if (!roleData || (roleData.role !== "teacher" && roleData.role !== "admin")) {
        navigate("/dashboard");
        return;
      }

      setUserRole(roleData.role);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          ย้อนกลับ Dashboard
        </Button>
        <h1 className="text-3xl font-bold mb-2">จัดการกิจกรรมทั้งหมด</h1>
        <p className="text-muted-foreground mb-8">
          เพิ่ม แก้ไข และจัดการกิจกรรมของโรงเรียน
        </p>
        <ActivityAllForm userRole={userRole} />
      </main>
      <Footer />
    </div>
  );
};

export default ActivityAllFormPage;
