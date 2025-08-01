import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewsFormData {
  title: string;
  content: string;
  author_name: string;
  category: string;
  published_date: string;
}

interface NewsFormProps {
  onNewsAdded?: () => void;
}

const NewsForm = ({ onNewsAdded }: NewsFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    content: "",
    author_name: "",
    category: "general",
    published_date: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (field: keyof NewsFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('news')
        .insert([formData]);

      if (error) {
        throw error;
      }

      toast({
        title: "สำเร็จ",
        description: "เพิ่มข่าวสารใหม่แล้ว",
      });

      // Reset form
      setFormData({
        title: "",
        content: "",
        author_name: "",
        category: "general",
        published_date: new Date().toISOString().split('T')[0],
      });

      // Call callback to refresh news list
      onNewsAdded?.();
    } catch (error) {
      console.error('Error adding news:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มข่าวสารได้",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>เพิ่มข่าวสารและประกาศใหม่</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">หัวข้อข่าว</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="กรอกหัวข้อข่าว"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">ผู้เขียน</Label>
              <Input
                id="author"
                value={formData.author_name}
                onChange={(e) => handleInputChange('author_name', e.target.value)}
                placeholder="ชื่อผู้เขียน"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">หมวดหมู่</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">ทั่วไป</SelectItem>
                  <SelectItem value="academic">วิชาการ</SelectItem>
                  <SelectItem value="activity">กิจกรรม</SelectItem>
                  <SelectItem value="announcement">ประกาศ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">วันที่เผยแพร่</Label>
              <Input
                id="date"
                type="date"
                value={formData.published_date}
                onChange={(e) => handleInputChange('published_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">เนื้อหา</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="กรอกเนื้อหาข่าว"
              rows={5}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            เพิ่มข่าวสาร
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsForm;