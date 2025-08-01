import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsForm from "@/components/NewsForm";

const Dashboard = () => {
  const { toast } = useToast();
  const [activityForm, setActivityForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    maxParticipants: "",
    location: ""
  });

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to Supabase when activities table is ready
    toast({
      title: "บันทึกกิจกรรมสำเร็จ!",
      description: "กิจกรรมได้ถูกเพิ่มเข้าระบบแล้ว",
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">ระบบจัดการโรงเรียน</h1>
          <p className="text-muted-foreground">จัดการข้อมูลและกิจกรรมของโรงเรียนบ้านค้อดอนแคน</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">เพิ่มขึ้น 2.1% จากเดือนที่แล้ว</p>
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

        {/* News Management */}
        <NewsForm />

        {/* Activity Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              บันทึกกิจกรรมภายใน
            </CardTitle>
            <CardDescription>
              เพิ่มกิจกรรมใหม่เข้าสู่ระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivitySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">ชื่อกิจกรรม</Label>
                  <Input
                    id="title"
                    value={activityForm.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="ป้อนชื่อกิจกรรม"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">หมวดหมู่</Label>
                  <Select value={activityForm.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">วิชาการ</SelectItem>
                      <SelectItem value="sports">กีฬา</SelectItem>
                      <SelectItem value="cultural">วัฒนธรรม</SelectItem>
                      <SelectItem value="volunteer">อาสาสมัคร</SelectItem>
                      <SelectItem value="art">ศิลปะ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">วันที่จัดกิจกรรม</Label>
                  <Input
                    id="date"
                    type="date"
                    value={activityForm.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">จำนวนผู้เข้าร่วมสูงสุด</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={activityForm.maxParticipants}
                    onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                    placeholder="จำนวนคน"
                    min="1"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">สถานที่</Label>
                  <Input
                    id="location"
                    value={activityForm.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="ป้อนสถานที่จัดกิจกรรม"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียดกิจกรรม</Label>
                <Textarea
                  id="description"
                  value={activityForm.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="อธิบายรายละเอียดของกิจกรรม"
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                บันทึกกิจกรรม
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;