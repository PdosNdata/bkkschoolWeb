import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";

interface NewsFormData {
  title: string;
  content: string;
  author_name: string;
  category: string;
  published_date: string;
  cover_image?: string;
}

interface NewsFormProps {
  onNewsAdded?: () => void;
}

const NewsForm = ({ onNewsAdded }: NewsFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    content: "",
    author_name: "",
    category: "general",
    published_date: new Date().toISOString().split('T')[0],
  });

  // Get current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Try to get user profile first
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
        
        const authorName = profile?.display_name || user.email || 'ผู้ใช้งาน';
        setFormData(prev => ({
          ...prev,
          author_name: authorName
        }));
      }
    };

    getCurrentUser();
  }, []);

  const handleInputChange = (field: keyof NewsFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `news/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพโหลดรูปภาพได้",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let coverImageUrl = "";
      
      // Upload image if selected
      if (coverImage) {
        const imageUrl = await uploadImage(coverImage);
        if (imageUrl) {
          coverImageUrl = imageUrl;
        }
      }

      const { error } = await supabase
        .from('news')
        .insert([{
          ...formData,
          cover_image: coverImageUrl || null
        }]);

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
        author_name: formData.author_name, // Keep the current user's name
        category: "general",
        published_date: new Date().toISOString().split('T')[0],
      });
      setCoverImage(null);
      setImagePreview("");

      // Call callback to refresh news list
      onNewsAdded?.();
    } catch (error) {
      console.error('Error adding news:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มข่าวสารได้",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
            <Label htmlFor="cover-image">รูปภาพปก</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                id="cover-image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="cover-image"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded">
                      <Upload className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">คลิกเพื่อเลือกรูปภาพปก</span>
                  </>
                )}
              </label>
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

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              ย้อนกลับ
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={uploading}
            >
              {uploading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsForm;