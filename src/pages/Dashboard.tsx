import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, FileText, Plus, BookOpen, Package, GraduationCap, Recycle, Megaphone, UsersRound, Building, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsForm from "@/components/NewsForm";
import ActivitiesForm from "@/components/ActivitiesForm";
import { supabase } from "@/integrations/supabase/client";
const Dashboard = () => {
  const {
    toast
  } = useToast();
  const [userRole, setUserRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    maxParticipants: "",
    location: ""
  });
  const allSystemCards = [{
    title: "ระบบตรวจการมาเรียน",
    description: "การมาและกลับของนักเรียน",
    icon: BookOpen,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    href: "/studentall",
    roles: ["teacher", "admin"]
  }, {
    title: "ระบบงานพัสดุ",
    description: "จัดการพัสดุ วัสดุ อุปกรณ์การศึกษา",
    icon: Package,
    color: "bg-green-50 border-green-300",
    iconColor: "text-green-600",
    href: "/supplies",
    roles: ["teacher", "admin"]
   }, {
    title: "ระบบกิจการนักเรียน",
    description: "การจัดกิจกรรมทั้งภายในและภายนอกโรงเรียน",
    icon: GraduationCap,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    href: "/StudentForm",
    roles: ["student", "teacher", "admin"]
  }, 
    {
    title: "กิจกรรมภายในโรงเรียน",
    description: "การจัดกิจกรรมทั้งภายในและภายนอกโรงเรียน",
    icon: GraduationCap,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    action: "activities",
    roles: ["student", "teacher", "admin"]
  },
    {
    title: "ประชาสัมพันธ์",
    description: "จัดการข่าวสาร ประกาศ และกิจกรรม",
    icon: Megaphone,
    color: "bg-pink-50 border-pink-200",
    iconColor: "text-pink-600",
    href: "/NewsForm",
    roles: ["teacher", "admin"]
  }, {
    title: "Admin",
    description: "จัดการระบบ ผู้ใช้งาน และการตั้งค่า",
    icon: Settings,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-600",
    href: "/admin",
    roles: ["admin"]
  }];

  // Filter system cards based on user role
  const systemCards = allSystemCards.filter(card => 
    card.roles.includes(userRole) || userRole === ""
  );

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          setUserRole(roleData?.role || "");
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);
  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to Supabase when activities table is ready
    toast({
      title: "บันทึกกิจกรรมสำเร็จ!",
      description: "กิจกรรมได้ถูกเพิ่มเข้าระบบแล้ว"
    });
    setActivityForm({
      title: "",
      description: "",
      category: "",
      date: "",
      maxParticipants: "",
      location: ""
    });
  };
  const handleInputChange = (field: string, value: string) => {
    setActivityForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">ระบบจัดการโรงเรียน</h1>
          <p className="text-lg text-muted-foreground">จัดการข้อมูลและกิจกรรมของโรงเรียนบ้านค้อดอนแคน</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">268</div>
              
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">กิจกรรมที่กำลังดำเนินการ</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">5 กิจกรรมใหม่ในสัปดาห์นี้</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ใบสมัครใหม่</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">รอการอนุมัติ 8 ใบสมัคร</p>
            </CardContent>
          </Card>
        </div>

        {/* System Management Cards */}
        <div className="mb-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemCards.map((system, index) => {
            const IconComponent = system.icon;
            
            if (system.action === "activities") {
              return (
                <Card 
                  key={index} 
                  className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${system.color} hover:scale-105`}
                  onClick={() => setActiveTab("activities")}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-lg shadow-sm bg-violet-200">
                        <IconComponent className={`h-8 w-8 ${system.iconColor}`} />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="text-xs">
                          เข้าใช้งาน
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors mt-4">
                      {system.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                      {system.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            }
            
            return (
              <Link key={index} to={system.href}>
                <Card className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${system.color} hover:scale-105`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-lg shadow-sm bg-violet-200">
                        <IconComponent className={`h-8 w-8 ${system.iconColor}`} />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="text-xs">
                          เข้าใช้งาน
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors mt-4">
                      {system.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                      {system.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          </div>
        </div>

        {/* Conditional Tab Content */}
        {activeTab === "activities" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">กิจกรรมภายในโรงเรียน</h2>
              <Button 
                onClick={() => setActiveTab("dashboard")}
                variant="outline"
                className="text-sm"
              >
                กลับสู่หน้าหลัก
              </Button>
            </div>
            <ActivitiesForm />
          </div>
        )}

      </main>

      <Footer />
    </div>;
};
export default Dashboard;