import { useState } from "react";
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
import NewsForm from "@/components/NewsForm";
const Dashboard = () => {
  const {
    toast
  } = useToast();
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    maxParticipants: "",
    location: ""
  });
  const systemCards = [{
    title: "ระบบห้องสมุด",
    description: "จัดการหนังสือ การยืม-คืน และทรัพยากรการเรียนรู้",
    icon: BookOpen,
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    href: "/library"
  }, {
    title: "ระบบงานพัสดุ",
    description: "จัดการพัสดุ วัสดุ อุปกรณ์การศึกษา",
    icon: Package,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    href: "/supplies"
  }, {
    title: "ระบบกิจการนักเรียน",
    description: "จัดการข้อมูลนักเรียน กิจกรรม และพฤติกรรม",
    icon: GraduationCap,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    href: "/student-affairs"
  }, {
    title: "ระบบงานวิชาการ",
    description: "จัดการหลักสูตร การสอน และประเมินผล",
    icon: FileText,
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-600",
    href: "/academic"
  }, {
    title: "ธนาคารขยะ",
    description: "โครงการรีไซเคิล การจัดการขยะ",
    icon: Recycle,
    color: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    href: "/waste-bank"
  }, {
    title: "ประชาสัมพันธ์",
    description: "จัดการข่าวสาร ประกาศ และกิจกรรม",
    icon: Megaphone,
    color: "bg-pink-50 border-pink-200",
    iconColor: "text-pink-600",
    href: "/public-relations"
  }, {
    title: "ระบบบุคลากร",
    description: "จัดการข้อมูลครู และเจ้าหน้าที่",
    icon: UsersRound,
    color: "bg-cyan-50 border-cyan-200",
    iconColor: "text-cyan-600",
    href: "/personnel"
  }, {
    title: "งานอาคารสถานที่",
    description: "จัดการอาคาร สิ่งก่อสร้าง และสภาพแวดล้อม",
    icon: Building,
    color: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600",
    href: "/facilities"
  }, {
    title: "Admin",
    description: "จัดการระบบ ผู้ใช้งาน และการตั้งค่า",
    icon: Settings,
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-600",
    href: "/admin"
  }];
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
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link to="/" className="flex items-center gap-2" aria-label="ไปหน้าแรก โรงเรียนบ้านค้อดอนแคน">
              <img
                src="https://i.postimg.cc/y8Y4TXJY/1.png"
                alt="โลโก้โรงเรียนบ้านค้อดอนแคน"
                className="h-8 w-auto"
                loading="lazy"
              />
              <span className="font-bold text-primary text-lg">โรงเรียนบ้านค้อดอนแคน</span>
            </Link>
          </div>
        </div>
      </header>
      
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
            return <Card key={index} className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${system.color} hover:scale-105`} onClick={() => window.location.href = system.href}>
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
                </Card>;
          })}
          </div>
        </div>

      </main>

      <Footer />
    </div>;
};
export default Dashboard;