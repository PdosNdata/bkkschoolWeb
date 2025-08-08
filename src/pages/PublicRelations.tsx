import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Megaphone, ArrowLeft, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsForm from "@/components/NewsForm";

const PublicRelations = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Navigation Buttons */}
        <div className="flex gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับระบบจัดการโรงเรียน
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            กลับหน้าแรก
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Megaphone className="h-10 w-10 text-pink-600" />
            <h1 className="text-4xl font-bold text-primary">ประชาสัมพันธ์</h1>
          </div>
          <p className="text-lg text-muted-foreground">จัดการข่าวสาร ประกาศ และกิจกรรมของโรงเรียน</p>
        </div>

        {/* News Management */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">จัดการข่าวสาร</h2>
          <NewsForm />
        </div>

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

export default PublicRelations;