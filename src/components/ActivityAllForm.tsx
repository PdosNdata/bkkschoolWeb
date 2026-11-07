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
import { withTimeout } from "@/lib/utils";

const MAX_IMAGE_MB = 12;

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
  user_id?: string | null;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
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
      // "กิจกรรมด้วยรักและห่วงใย" has its own dedicated management page
      // (โครงการด้วยรักและห่วงใย), so it's excluded from this general list.
      .neq("category", "กิจกรรมด้วยรักและห่วงใย")
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
    const picked = Array.from(e.target.files || []);
    if (picked.length + selectedFiles.length > 10) {
      toast({
        title: "จำนวนไฟล์เกินกำหนด",
        description: "สามารถอัปโหลดได้สูงสุด 10 ภาพ",
        variant: "destructive",
      });
      return;
    }

    const files = picked.filter((file) => file.size <= MAX_IMAGE_MB * 1024 * 1024);
    if (files.length < picked.length) {
      toast({
        title: "มีไฟล์ถูกข้าม",
        description: `ไฟล์ที่เกิน ${MAX_IMAGE_MB}MB จะไม่ถูกเพิ่ม (${picked.length - files.length} ไฟล์)`,
        variant: "destructive",
      });
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

      const { error: uploadError } = await withTimeout(
        supabase.storage.from("media-files").upload(filePath, file),
        30000,
        `อัพโหลดรูปภาพ ${file.name}`,
      );

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
        const { error } = await withTimeout(
          supabase.from("activities").update(dataToSubmit).eq("id", editingId),
          20000,
          "บันทึกข้อมูล",
        );

        if (error) throw error;

        toast({
          title: "อัปเดตสำเร็จ",
          description: "แก้ไขกิจกรรมเรียบร้อยแล้ว",
        });
      } else {
        const { error } = await withTimeout(
          supabase.from("activities").insert([{ ...dataToSubmit, user_id: currentUserId }]),
          20000,
          "บันทึกข้อมูล",
        );

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
      const fallback = "ไม่สามารถบันทึกข้อมูลได้";
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : fallback,
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
      <Card className="overflow-hidden rounded-3xl border-sky-100 shadow-[0_12px_30px_-16px_rgba(56,189,248,0.6)]">
        <div className="flex items-center gap-3 bg-gradient-to-r from-sky-100 via-indigo-50 to-violet-100 px-6 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-xl shadow-sm">{editingId ? "✏️" : "📝"}</span>
          <h2 className="text-xl font-bold text-indigo-900">{editingId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}</h2>
        </div>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-2xl border p-4 shadow-sm border-sky-100 bg-sky-50/60">
              <Label htmlFor="title" className="mb-2 flex items-center gap-2 text-base font-semibold text-sky-900">📌 ชื่อหัวข้อ *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="ระบุชื่อหัวข้อกิจกรรม"
                className="h-11 rounded-xl bg-white shadow-inner border-sky-200 focus-visible:ring-sky-400"
                required
              />
            </div>

            <div className="rounded-2xl border p-4 shadow-sm border-teal-100 bg-teal-50/60">
              <Label htmlFor="author_name" className="mb-2 flex items-center gap-2 text-base font-semibold text-teal-900">👤 ผู้เขียน</Label>
              <Input
                id="author_name"
                name="author_name"
                value={formData.author_name}
                onChange={handleInputChange}
                placeholder="ชื่อผู้เขียน"
                className="h-11 rounded-xl bg-white shadow-inner border-teal-200 focus-visible:ring-teal-400"
              />
            </div>

            <div className="rounded-2xl border p-4 shadow-sm border-amber-100 bg-amber-50/60">
              <Label htmlFor="category" className="mb-2 flex items-center gap-2 text-base font-semibold text-amber-900">🔖 ประเภทกิจกรรม *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="category" className="h-11 rounded-xl bg-white shadow-inner border-amber-200 focus:ring-amber-400">
                  <SelectValue placeholder="เลือกประเภทกิจกรรม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="กิจกรรมภายใน">กิจกรรมภายใน</SelectItem>
                  <SelectItem value="กิจกรรมภายนอก">กิจกรรมภายนอก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border p-4 shadow-sm border-violet-100 bg-violet-50/60">
              <Label htmlFor="content" className="mb-2 flex items-center gap-2 text-base font-semibold text-violet-900">📖 รายละเอียดกิจกรรม *</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="ระบุรายละเอียดกิจกรรม"
                className="min-h-[200px] rounded-xl bg-white shadow-inner border-violet-200 focus-visible:ring-violet-400"
                required
              />
            </div>

            <div className="rounded-2xl border p-4 shadow-sm border-rose-100 bg-rose-50/50">
              <Label htmlFor="images" className="mb-2 flex items-center gap-2 text-base font-semibold text-rose-900">📷 อัปโหลดภาพ (สูงสุด 10 ภาพ)</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="h-11 cursor-pointer rounded-xl bg-white shadow-inner border-dashed border-rose-200 file:mr-3 file:rounded-full file:border-0 file:bg-rose-100 file:px-3 file:text-rose-700"
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="rounded-2xl border p-4 shadow-sm border-slate-100 bg-white">
                <Label className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-700">🖼 ภาพที่เลือก ({imagePreviews.length}/10)</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="group relative rounded-xl bg-white p-1 shadow-md ring-1 ring-black/5 transition hover:-translate-y-0.5">
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

            <div className="flex gap-3">
              <Button type="submit" disabled={uploading} className="h-11 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 font-semibold text-white shadow-md shadow-indigo-200 hover:from-sky-600 hover:to-indigo-600">
                {uploading ? "กำลังบันทึก..." : editingId ? "อัปเดตกิจกรรม" : "เพิ่มกิจกรรม"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm} className="h-11 rounded-full border-slate-200 px-5">
                  ยกเลิก
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card className="overflow-hidden rounded-3xl border-violet-100 shadow-[0_12px_30px_-16px_rgba(139,92,246,0.5)]">
        <div className="flex items-center gap-3 bg-gradient-to-r from-violet-100 via-indigo-50 to-sky-100 px-6 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-xl shadow-sm">📚</span>
          <h2 className="text-xl font-bold text-indigo-900">รายการกิจกรรมทั้งหมด</h2>
        </div>
        <CardContent className="pt-6">
          
          {/* Search and Filter */}
          <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
            <div>
              <Label htmlFor="search">ค้นหาชื่อกิจกรรม</Label>
              <Input
                id="search"
                type="text"
                placeholder="🔍 ค้นหาจากชื่อกิจกรรม..."
                className="mt-1 h-11 rounded-xl bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filter-category">ประเภทกิจกรรม</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="filter-category" className="mt-1 h-11 rounded-xl bg-white">
                  <SelectValue placeholder="เลือกประเภทกิจกรรม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="กิจกรรมภายใน">กิจกรรมภายใน</SelectItem>
                  <SelectItem value="กิจกรรมภายนอก">กิจกรรมภายนอก</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loadingActivities ? (
            <p className="text-center py-8">กำลังโหลด...</p>
          ) : (() => {
            const filteredActivities = activities.filter((activity) => {
              const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesCategory = selectedCategory === "all" || activity.category === selectedCategory;
              return matchesSearch && matchesCategory;
            });

            return filteredActivities.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                {activities.length === 0 ? "ยังไม่มีกิจกรรม" : "ไม่พบกิจกรรมที่ค้นหา"}
              </p>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-indigo-50/70 hover:bg-indigo-50/70">
                    <TableHead>ภาพปก</TableHead>
                    <TableHead>หัวข้อ</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>ผู้เขียน</TableHead>
                    <TableHead>วันที่สร้าง</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => {
                    const canManage = userRole === "admin" || (!!currentUserId && activity.user_id === currentUserId);
                    return (
                    <TableRow key={activity.id} className="transition-colors hover:bg-sky-50/60">
                      <TableCell>
                        {activity.images && activity.images.length > 0 ? (
                          <img
                            src={activity.images[activity.cover_image_index || 0]}
                            alt={activity.title}
                            className="h-20 w-20 rounded-xl object-cover shadow-sm ring-2 ring-white"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-violet-100">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{activity.title}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${activity.category === "กิจกรรมภายนอก" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"}`}>
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
                            className="rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShareFacebook(activity)}
                            title="แชร์ Facebook"
                            className="rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                          >
                            <Facebook className="w-4 h-4" />
                          </Button>
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(activity)}
                              title="แก้ไข"
                              className="rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(activity.id)}
                              title="ลบ"
                              className="rounded-full bg-rose-50 hover:bg-rose-100"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityAllForm;
