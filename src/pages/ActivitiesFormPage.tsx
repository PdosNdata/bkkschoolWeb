import ActivitiesForm from "@/components/ActivitiesForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ActivitiesFormPage = () => {
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        const role = roleData?.role || "";
        setUserRole(role);
        
        // Only teachers can access this page
        if (role !== "teacher") {
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">กำลังตรวจสอบสิทธิ์...</div>
        </div>
      </div>
    );
  }

  if (userRole !== "teacher") {
    return null; // This should not render as user will be redirected
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">กิจกรรมภายในโรงเรียน</h1>
          <p className="text-lg text-muted-foreground">จัดการกิจกรรมและข้อมูลกิจกรรมของโรงเรียน</p>
        </div>
        <ActivitiesForm />
      </main>
      <Footer />
    </div>
  );
};

export default ActivitiesFormPage;