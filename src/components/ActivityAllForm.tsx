import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Share2, Facebook, X, Image as ImageIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from "sweetalert2";

interface ActivityAllFormData {
  title: string;
  content: string;
  author_name: string;
  category: string;
  images: string[];
  cover_image_index: number;
}

interface Activity {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string;
  images: string[];
  cover_image_index: number;
  created_at: string;
}

interface ActivityAllFormProps {
  userRole: string | null;
}

const ActivityAllForm = ({ userRole }: ActivityAllFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ActivityAllFormData>({
    title: "",
    content: "",
    author_name: "",
    category: "กิจกรรมภายใน",
    images: [],
    cover_image_index: 0,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profile?.display_name) {
        setFormData((prev) => ({ ...prev, author_name: profile.display_name }));
      }
    }
  };

  const fetchActivities = async () => {
    setLoadingActivities(true);
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลกิจกรรมได้",
        variant: "destructive",
      });
    } else {
      setActivities(data || []);
    }
    setLoadingActivities(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 10) {
      toast({
        title: "จำนวนไฟล์เกินกำหนด",
        description: "สามารถอัปโหลดได้สูงสุด 10 ภาพ",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    
    // Adjust cover image index if needed
    if (formData.cover_image_index === index) {
      setFormData((prev) => ({ ...prev, cover_image_index: 0 }));
    } else if (formData.cover_image_index > index) {
      setFormData((prev) => ({ ...prev, cover_image_index: prev.cover_image_index - 1 }));
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("media-files")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("media-files")
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "โปรดระบุชื่อหัวข้อและรายละเอียดกิจกรรม",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let imageUrls = formData.images;

      // Upload new images if any
      if (selectedFiles.length > 0) {
        const newUrls = await uploadImages();
        imageUrls = [...imageUrls, ...newUrls];
      }

      const dataToSubmit = {
        ...formData,
        images: imageUrls,
      };

      if (editingId) {
        const { error } = await supabase
          .from("activities")
          .update(dataToSubmit)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "อัปเดตสำเร็จ",
          description: "แก้ไขกิจกรรมเรียบร้อยแล้ว",
        });
      } else {
        const { error } = await supabase
          .from("activities")
          .insert([dataToSubmit]);

        if (error) throw error;

        toast({
          title: "บันทึกสำเร็จ",
          description: "เพิ่มกิจกรรมใหม่เรียบร้อยแล้ว",
        });
      }

      resetForm();
      fetchActivities();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      author_name: formData.author_name,
      category: "กิจกรรมภายใน",
      images: [],
      cover_image_index: 0,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setEditingId(null);
  };

  const handleEdit = (activity: Activity) => {
    setFormData({
      title: activity.title,
      content: activity.content,
      author_name: activity.author_name,
      category: activity.category || "กิจกรรมภายใน",
      images: activity.images || [],
      cover_image_index: activity.cover_image_index || 0,
    });
    setEditingId(activity.id);
    setImagePreviews(activity.images || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (userRole !== "admin") {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "เฉพาะแอดมินเท่านั้นที่สามารถลบกิจกรรมได้",
        variant: "destructive",
      });
      return;
    }

    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", id);

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบกิจกรรมได้",
          variant: "destructive",
        });
      } else {
        toast({
          title: "ลบสำเร็จ",
          description: "ลบกิจกรรมเรียบร้อยแล้ว",
        });
        fetchActivities();
      }
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/activity/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "คัดลอกลิงก์สำเร็จ",
      description: "คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว",
    });
  };

  const handleShareFacebook = (activity: Activity) => {
    const url = `${window.location.origin}/activity/${activity.id}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">ชื่อหัวข้อ *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="ระบุชื่อหัวข้อกิจกรรม"
                required
              />
            </div>

            <div>
              <Label htmlFor="author_name">ผู้เขียน</Label>
              <Input
                id="author_name"
                name="author_name"
                value={formData.author_name}
                onChange={handleInputChange}
                placeholder="ชื่อผู้เขียน"
              />
            </div>

            <div>
              <Label htmlFor="category">ประเภทกิจกรรม *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="เลือกประเภทกิจกรรม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="กิจกรรมด้วยรักและห่วงใย">กิจกรรมด้วยรักและห่วงใย</SelectItem>
                  <SelectItem value="กิจกรรมภายใน">กิจกรรมภายใน</SelectItem>
                  <SelectItem value="กิจกรรมภายนอก">กิจกรรมภายนอก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content">รายละเอียดกิจกรรม *</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="ระบุรายละเอียดกิจกรรม"
                className="min-h-[200px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="images">อัปโหลดภาพ (สูงสุด 10 ภาพ)</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {imagePreviews.length > 0 && (
              <div>
                <Label>ภาพที่เลือก ({imagePreviews.length}/10)</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2"
                        style={{
                          borderColor: formData.cover_image_index === index ? "#10b981" : "#e5e7eb"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, cover_image_index: index }))}
                        className={`absolute bottom-1 left-1 px-2 py-1 text-xs rounded ${
                          formData.cover_image_index === index
                            ? "bg-green-500 text-white"
                            : "bg-gray-800 bg-opacity-70 text-white opacity-0 group-hover:opacity-100"
                        } transition-opacity`}
                      >
                        {formData.cover_image_index === index ? "ภาพปก" : "ตั้งเป็นภาพปก"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={uploading}>
                {uploading ? "กำลังบันทึก..." : editingId ? "อัปเดตกิจกรรม" : "เพิ่มกิจกรรม"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  ยกเลิก
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4">รายการกิจกรรมทั้งหมด</h2>
          
          {loadingActivities ? (
            <p className="text-center py-8">กำลังโหลด...</p>
          ) : activities.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">ยังไม่มีกิจกรรม</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ภาพปก</TableHead>
                    <TableHead>หัวข้อ</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>ผู้เขียน</TableHead>
                    <TableHead>วันที่สร้าง</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        {activity.images && activity.images.length > 0 ? (
                          <img
                            src={activity.images[activity.cover_image_index || 0]}
                            alt={activity.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{activity.title}</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {activity.category || 'กิจกรรมภายใน'}
                        </span>
                      </TableCell>
                      <TableCell>{activity.author_name}</TableCell>
                      <TableCell>{formatDate(activity.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyLink(activity.id)}
                            title="คัดลอกลิงก์"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShareFacebook(activity)}
                            title="แชร์ Facebook"
                          >
                            <Facebook className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(activity)}
                            title="แก้ไข"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {userRole === "admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(activity.id)}
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityAllForm;
