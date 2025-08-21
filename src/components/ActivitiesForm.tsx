import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ActivitiesForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    cover_image: "",
    author_name: "User"
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `activity-${Date.now()}.${fileExt}`;
      const filePath = `activities/${fileName}`;

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
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let coverImageUrl = formData.cover_image;
      
      if (imageFile) {
        coverImageUrl = await handleImageUpload(imageFile);
      }

      const { error } = await supabase
        .from('activities')
        .insert([{
          title: formData.title,
          content: formData.content,
          cover_image: coverImageUrl,
          author_name: formData.author_name
        }]);

      if (error) {
        throw error;
      }

      // Show success alert with 5 second timer
      Swal.fire({
        title: 'บันทึกสำเร็จ!',
        text: 'กิจกรรมได้ถูกบันทึกเรียบร้อยแล้ว',
        icon: 'success',
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false
      });

      // Reset form
      setFormData({
        title: "",
        content: "",
        cover_image: "",
        author_name: "User"
      });
      setImageFile(null);
    } catch (error) {
      console.error('Error saving activity:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถบันทึกกิจกรรมได้',
        icon: 'error',
        timer: 1800,
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-news-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ย้อนกลับไปหน้า Dashboard
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm shadow-elegant">
          <CardHeader className="bg-gradient-card rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-foreground">
              เพิ่มกิจกรรมใหม่
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  หัวข้อกิจกรรมทำอะไร
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-2"
                  placeholder="ระบุหัวข้อกิจกรรม..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="cover_image" className="text-sm font-medium text-foreground">
                  ภาพปกย่อ
                </Label>
                <div className="mt-2 space-y-4">
                  <Input
                    id="cover_image"
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleInputChange}
                    placeholder="URL ของภาพปก (ถ้ามี)"
                  />
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">หรือ</span>
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">อัปโหลดภาพ</span>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </Label>
                    {imageFile && (
                      <span className="text-sm text-muted-foreground">
                        เลือกไฟล์: {imageFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="author_name" className="text-sm font-medium text-foreground">
                  ผู้เขียน
                </Label>
                <Input
                  id="author_name"
                  name="author_name"
                  value={formData.author_name}
                  onChange={handleInputChange}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content" className="text-sm font-medium text-foreground">
                  รายละเอียด
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="mt-2 min-h-[200px]"
                  placeholder="เขียนรายละเอียดกิจกรรม..."
                  required
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={uploading}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {uploading ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ย้อนกลับกลับหน้า Dashboard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivitiesForm;