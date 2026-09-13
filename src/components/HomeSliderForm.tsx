import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Edit, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { withTimeout } from "@/lib/utils";
import { HomeSlide, homeSlidesTable, HOME_SLIDES_BUCKET, HOME_SLIDES_PREFIX } from "@/lib/homeSlides";

const MAX_IMAGE_MB = 12;

interface FormState {
  title: string;
  description: string;
  link: string;
  display_order: string;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  link: "",
  display_order: "0",
};

const HomeSliderForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("approved", true);
        setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
      }
    };
    getCurrentUser();
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoadingSlides(true);
      const { data, error } = await homeSlidesTable()
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      setSlides((data as HomeSlide[]) || []);
    } catch (error) {
      console.error("Error fetching home slides:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายการสไลด์ได้",
        variant: "destructive",
      });
    } finally {
      setLoadingSlides(false);
    }
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast({
        title: "ไฟล์รูปใหญ่เกินไป",
        description: `เลือกไฟล์ไม่เกิน ${MAX_IMAGE_MB}MB (ไฟล์นี้ ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageFile(null);
    setImagePreview("");
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${HOME_SLIDES_PREFIX}/${fileName}`;

    const { error: uploadError } = await withTimeout(
      supabase.storage.from(HOME_SLIDES_BUCKET).upload(filePath, file),
      30000,
      "อัพโหลดรูปภาพ",
    );
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(HOME_SLIDES_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  const handleEdit = (slide: HomeSlide) => {
    setEditingId(slide.id);
    setFormData({
      title: slide.title,
      description: slide.description || "",
      link: slide.link || "",
      display_order: String(slide.display_order ?? 0),
    });
    setImagePreview(slide.image_url);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && !imageFile) {
      toast({
        title: "กรุณาเลือกรูปภาพ",
        description: "สไลด์ใหม่ต้องมีรูปภาพประกอบ",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let imageUrl = imagePreview.startsWith("data:") ? "" : imagePreview;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        title: formData.title,
        description: formData.description || null,
        link: formData.link || null,
        display_order: Number(formData.display_order) || 0,
        image_url: imageUrl,
      };

      if (editingId) {
        const { error } = await withTimeout(
          homeSlidesTable().update(payload).eq("id", editingId) as Promise<{ error: Error | null }>,
          20000,
          "บันทึกข้อมูล",
        );
        if (error) throw error;
        toast({ title: "สำเร็จ", description: "แก้ไขสไลด์เรียบร้อยแล้ว" });
      } else {
        const { error } = await withTimeout(
          homeSlidesTable().insert([payload]) as Promise<{ error: Error | null }>,
          20000,
          "บันทึกข้อมูล",
        );
        if (error) throw error;
        toast({ title: "สำเร็จ", description: "เพิ่มสไลด์ใหม่แล้ว" });
      }

      resetForm();
      fetchSlides();
    } catch (error) {
      console.error("Error saving home slide:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบสไลด์นี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });
    if (!result.isConfirmed) return;

    const { error } = await homeSlidesTable().delete().eq("id", id);
    if (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถลบสไลด์ได้", variant: "destructive" });
      return;
    }
    toast({ title: "ลบสำเร็จ", description: "ลบสไลด์เรียบร้อยแล้ว" });
    fetchSlides();
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          เฉพาะแอดมินเท่านั้นที่จัดการสไลด์หน้าแรกได้
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{editingId ? "แก้ไขสไลด์" : "เพิ่มสไลด์ใหม่"}</CardTitle>
            {editingId && (
              <Button variant="outline" size="sm" onClick={resetForm}>
                ยกเลิกการแก้ไข
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">หัวข้อสไลด์</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="เช่น กิจกรรมนักเรียน"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="คำอธิบายสั้น ๆ ใต้หัวข้อ"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link">ลิงก์ปลายทาง (ถ้ามี)</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => handleInputChange("link", e.target.value)}
                  placeholder="เช่น #activities หรือ /activities"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">ลำดับการแสดง</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleInputChange("display_order", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slide-image">รูปภาพสไลด์</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  id="slide-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="slide-image" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-w-full h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                        title="ลบรูปภาพนี้"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">คลิกเพื่อเลือกรูปภาพสไลด์</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                ย้อนกลับ
              </Button>
              <Button type="submit" size="sm" disabled={uploading}>
                {uploading ? "กำลังบันทึก..." : editingId ? "อัพเดต" : "บันทึก"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายการสไลด์หน้าแรก</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSlides ? (
            <div className="text-center py-8">กำลังโหลดข้อมูล...</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">รูปภาพ</TableHead>
                    <TableHead>หัวข้อ</TableHead>
                    <TableHead className="w-[100px]">ลำดับ</TableHead>
                    <TableHead className="w-[150px] text-center">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slides.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        ยังไม่มีสไลด์ (เว็บจะแสดงภาพตัวอย่างเริ่มต้นแทน)
                      </TableCell>
                    </TableRow>
                  ) : (
                    slides.map((slide) => (
                      <TableRow key={slide.id}>
                        <TableCell>
                          <img src={slide.image_url} alt={slide.title} className="w-20 h-14 object-cover rounded" />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{slide.title}</div>
                          {slide.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">{slide.description}</div>
                          )}
                        </TableCell>
                        <TableCell>{slide.display_order}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(slide)} title="แก้ไข">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(slide.id)}
                              className="text-destructive hover:text-destructive"
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeSliderForm;
