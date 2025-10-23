import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, FileText, Plus, BookOpen, Package, GraduationCap, Recycle, Megaphone, UsersRound, Building, Settings, UserCheck, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsForm from "@/components/NewsForm";
import { supabase } from "@/integrations/supabase/client";
const Dashboard = () => {
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
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
    roles: ["teacher", "admin"],
    permissionName: "attendance_system"
  }, {
    title: "ระบบงานพัสดุ",
    description: "จัดการพัสดุ วัสดุ อุปกรณ์การศึกษา",
    icon: Package,
    color: "bg-green-50 border-green-300",
    iconColor: "text-green-600",
    href: "/supplies",
    roles: ["teacher", "admin"],
    permissionName: "supplies_system"
   }, {
    title: "ระบบกิจการนักเรียน",
    description: "การจัดกิจกรรมทั้งภายในและภายนอกโรงเรียน",
    icon: GraduationCap,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    href: "/StudentForm",
    roles: ["student", "teacher", "admin"],
    permissionName: "student_affairs"
  }, 
  {
    title: "กิจกรรมภายใน",
    description: "การจัดกิจกรรมทั้งภายในและภายนอกโรงเรียน",
    icon: GraduationCap,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    href: "/activities-form",
    roles: ["teacher", "admin"],
    permissionName: "internal_activities"
  },
  {
    title: "กิจกรรมทั้งหมด",
    description: "จัดการกิจกรรมแบบละเอียด พร้อมอัปโหลดหลายภาพ",
    icon: Calendar,
    color: "bg-violet-50 border-violet-200",
    iconColor: "text-violet-600",
    href: "/activity-all-form",
    roles: ["teacher", "admin"],
    permissionName: "all_activities"
  },
    {
    title: "ประชาสัมพันธ์",
    description: "จัดการข่าวสาร ประกาศ และกิจกรรม",
    icon: Megaphone,
    color: "bg-pink-50 border-pink-200",
    iconColor: "text-pink-600",
    href: "/NewsForm",
    roles: ["teacher", "admin"],
    permissionName: "public_relations"
  }, {
    title: "คลังสื่อออนไลน์",
    description: "จัดการสื่อการเรียนรู้ วิดีโอ เอกสาร และลิงค์ต่างๆ",
    icon: Megaphone,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-600",
    href: "/media-form",
    roles: ["teacher", "admin"],
    permissionName: "media_library"
  }, {
    title: "ระบบบุคลากร",
    description: "จัดการข้อมูลครู อาจารย์ และเจ้าหน้าที่",
    icon: UserCheck,
    color: "bg-teal-50 border-teal-200",
    iconColor: "text-teal-600",
    href: "/personnel",
    roles: ["admin"],
    permissionName: "personnel_system"
  }, {
    title: "จัดการสิทธิ์เมนู",
    description: "กำหนดสิทธิ์การเข้าใช้เมนูต่าง ๆ สำหรับผู้ใช้",
    icon: Shield,
    color: "bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-600",
    href: "/menu-permissions",
    roles: ["admin"],
    permissionName: "menu_permissions"
  }, {
    title: "Admin",
    description: "จัดการระบบ ผู้ใช้งาน และการตั้งค่า",
    icon: Settings,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-600",
    href: "/admin",
    roles: ["admin"],
    permissionName: "admin_panel"
  }];

  // Filter system cards based on user role and permissions
  const systemCards = allSystemCards.filter(card => {
    // Admin sees everything
    if (userRole === "admin") return true;
    
    // For other roles, check if they have the specific permission
    const hasPermission = card.permissionName && userPermissions.includes(card.permissionName);
    console.log('Card:', card.title, 'Permission:', card.permissionName, 'Has permission:', hasPermission, 'User permissions:', userPermissions);
    return hasPermission;
  });

  useEffect(() => {
    const fetchUserRoleAndPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }

        // Check if user can access dashboard (admin or teacher)
        const { data: canAccess, error: accessError } = await supabase.rpc('can_access_dashboard');
        
        console.log('Can access dashboard:', canAccess, 'Error:', accessError);
        
        if (accessError) {
          console.error('Error checking dashboard access:', accessError);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถตรวจสอบสิทธิ์การเข้าถึงได้",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        if (canAccess !== true) {
          toast({
            title: "ไม่มีสิทธิ์เข้าถึง",
            description: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        // Fetch user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('approved', true)
          .single();
        
        if (roleData) {
          setUserRole(roleData.role);
        }

        // Fetch user permissions
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('user_permissions')
          .select('permission_name')
          .eq('user_id', user.id)
          .eq('granted', true);
        
        console.log('Permissions query result:', { permissionsData, permissionsError, userId: user.id });
        
        if (permissionsData) {
          const permissions = permissionsData.map(p => p.permission_name);
          setUserPermissions(permissions);
          console.log('User permissions:', permissions);
        } else {
          console.log('No permissions data found or error:', permissionsError);
          setUserPermissions([]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user role:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถตรวจสอบสิทธิ์การใช้งานได้",
          variant: "destructive"
        });
        navigate('/');
      }
    };

    fetchUserRoleAndPermissions();
  }, [navigate, toast]);
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
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์การใช้งาน...</p>
        </div>
      </div>
    );
  }

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
            
            return <Link key={index} to={system.href}>
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
            </Link>;
          })}
          </div>
        </div>


      </main>

      <Footer />
    </div>;
};
export default Dashboard;