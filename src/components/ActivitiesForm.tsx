import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Edit, Trash2, Share2, Copy, X } from "lucide-react";
import Swal from "sweetalert2";
import { withTimeout } from "@/lib/utils";

const MAX_IMAGE_MB = 12;
const MAX_IMAGES = 50; // รูปต่อกิจกรรม
const MAX_SIDE = 1920; // ย่อรูปให้ด้านยาวไม่เกินนี้ก่อนอัพโหลด (ไฟล์เล็กลง อัพโหลด 50 รูปได้เร็ว)

/** ย่อรูปใหญ่เป็น JPEG ก่อนอัพโหลด — ถ้าย่อไม่ได้ (เช่น GIF, HEIC ที่เบราว์เซอร์ไม่รองรับ) ใช้ไฟล์เดิม */
async function shrinkImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) { bmp.close(); return file; }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) { bmp.close(); return file; }
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
const ACTIVITY_CATEGORY = "กิจกรรมด้วยรักและห่วงใย";

interface ActivitiesFormData {
  title: string;
  content: string;
  author_name: string;
  images?: string[];
  cover_image_index?: number;
}

interface ActivityItem {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  images?: string[];
  cover_image_index?: number;
  user_id?: string | null;
}

interface ActivitiesFormProps {
  onActivityAdded?: () => void;
}

const ActivitiesForm = ({ onActivityAdded }: ActivitiesFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activitiesList, setActivitiesList] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [formData, setFormData] = useState<ActivitiesFormData>({
    title: "",
    content: "",
    author_name: "",
    images: [],
    cover_image_index: 0,
  });

  // Get current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);

        const [{ data: profile }, { data: roles }] = await Promise.all([
          supabase.from('profiles').select('display_name').eq('id', user.id).single(),
          supabase.from('user_roles').select('role').eq('user_id', user.id).eq('approved', true),
        ]);

        const authorName = profile?.display_name || user.email || 'ผู้ใช้งาน';
        setFormData(prev => ({
          ...prev,
          author_name: authorName
        }));
        setIsAdmin((roles ?? []).some((r) => r.role === 'admin'));
      }
    };

    getCurrentUser();
    fetchAllActivities();
  }, []);

  const fetchAllActivities = async () => {
    try {
      setLoadingActivities(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('category', ACTIVITY_CATEGORY)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivitiesList(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลกิจกรรมได้",
        variant: "destructive",
      });
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleInputChange = (field: keyof ActivitiesFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);

    // นับรวมรูปเดิมของกิจกรรม (ตอนแก้ไข) + รูปที่เลือกใหม่
    if (imagePreviews.length + picked.length > MAX_IMAGES) {
      toast({
        title: "เกินจำนวนที่กำหนด",
        description: `ใส่รูปได้สูงสุด ${MAX_IMAGES} รูปต่อกิจกรรม (ตอนนี้มี ${imagePreviews.length} รูป เพิ่มได้อีก ${Math.max(0, MAX_IMAGES - imagePreviews.length)} รูป)`,
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

    // Add new files to existing ones
    setSelectedFiles(prev => [...prev, ...files]);

    // Generate previews for new files
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // Adjust cover image index if necessary
    if (coverImageIndex === index) {
      setCoverImageIndex(0);
    } else if (coverImageIndex > index) {
      setCoverImageIndex(prev => prev - 1);
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: (string | null)[] = new Array(files.length).fill(null);
    let done = 0;
    setUploadProgress(`กำลังอัพโหลดรูป 0/${files.length}`);
    const one = async (file: File, i: number) => {
      try {
        const small = await shrinkImage(file);
        const fileExt = small.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `activities/${fileName}`;
        const { error: uploadError } = await withTimeout(
          supabase.storage.from('news-images').upload(filePath, small),
          60000,
          `อัพโหลดรูปภาพ ${file.name}`,
        );
        if (uploadError) throw uploadError;
        urls[i] = supabase.storage.from('news-images').getPublicUrl(filePath).data.publicUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        const message = error instanceof Error ? error.message : `ไม่สามารถอัพโหลดรูปภาพ ${file.name} ได้`;
        toast({ title: "อัพโหลดรูปภาพไม่สำเร็จ", description: message, variant: "destructive" });
      } finally {
        done++;
        setUploadProgress(`กำลังอัพโหลดรูป ${done}/${files.length}`);
      }
    };
    // อัพโหลดพร้อมกันทีละ 4 รูป (คงลำดับรูปตามที่เลือก)
    let next = 0;
    const worker = async () => { while (next < files.length) { const i = next++; await one(files[i], i); } };
    await Promise.all(Array.from({ length: Math.min(4, files.length) }, worker));
    setUploadProgress("");
    return urls.filter((u): u is string => !!u);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrls = formData.images || [];
      
      // Upload new images if selected
      if (selectedFiles.length > 0) {
        const uploadedUrls = await uploadImages(selectedFiles);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      if (editingId) {
        // Update existing activity
        const { error } = await withTimeout(
          supabase
            .from('activities')
            .update({
              title: formData.title,
              content: formData.content,
              author_name: formData.author_name,
              images: imageUrls,
              cover_image_index: coverImageIndex,
              category: ACTIVITY_CATEGORY
            })
            .eq('id', editingId),
          20000,
          "บันทึกข้อมูล",
        );

        if (error) throw error;

        Swal.fire({
          title: "สำเร็จ!",
          text: "แก้ไขกิจกรรมเรียบร้อยแล้ว",
          icon: "success",
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      } else {
        // Insert new activity
        const { error } = await withTimeout(
          supabase
            .from('activities')
            .insert([{
              title: formData.title,
              content: formData.content,
              author_name: formData.author_name,
              images: imageUrls,
              cover_image_index: coverImageIndex,
              user_id: currentUserId,
              category: ACTIVITY_CATEGORY
            }]),
          20000,
          "บันทึกข้อมูล",
        );

        if (error) throw error;

        Swal.fire({
          title: "สำเร็จ!",
          text: "เพิ่มกิจกรรมใหม่แล้ว",
          icon: "success",
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }

      // Reset form
      resetForm();
      
      // Call callback to refresh activities list
      onActivityAdded?.();
      fetchAllActivities(); // Refresh the activities list
    } catch (error) {
      console.error('Error saving activity:', error);
      const fallback = editingId ? "ไม่สามารถแก้ไขกิจกรรมได้" : "ไม่สามารถเพิ่มกิจกรรมได้";
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
      author_name: formData.author_name, // Keep the current user's name
      images: [],
      cover_image_index: 0,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setCoverImageIndex(0);
    setEditingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEdit = (activityItem: ActivityItem) => {
    setEditingId(activityItem.id);
    setFormData({
      title: activityItem.title,
      content: activityItem.content,
      author_name: activityItem.author_name,
      images: activityItem.images || [],
      cover_image_index: activityItem.cover_image_index || 0,
    });
    
    // Set image previews if activity has images
    if (activityItem.images && activityItem.images.length > 0) {
      setImagePreviews(activityItem.images);
      setCoverImageIndex(activityItem.cover_image_index || 0);
    }
    
    // Clear selected files when editing
    setSelectedFiles([]);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast({
      title: "โหลดข้อมูลแล้ว",
      description: "สามารถแก้ไขข้อมูลในฟอร์มด้านบนได้เลย",
    });
  };

  const handleDelete = async (activityId: string) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการลบกิจกรรมนี้หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      await Swal.fire(
        'ลบสำเร็จ!',
        'กิจกรรมถูกลบเรียบร้อยแล้ว',
        'success'
      );

      fetchAllActivities(); // Refresh the list
    } catch (error) {
      console.error('Error deleting activity:', error);
      await Swal.fire(
        'เกิดข้อผิดพลาด!',
        'ไม่สามารถลบกิจกรรมได้',
        'error'
      );
    }
  };

  const generateShareLinks = (activityItem: ActivityItem) => {
    const baseUrl = 'https://www.bankhodonkan.ac.th';
    const activityUrl = `${baseUrl}/#activity-detail-${activityItem.id}`;
    const title = activityItem.title;
    const content = activityItem.content.substring(0, 100) + (activityItem.content.length > 100 ? '...' : '');
    const shareText = `${title}\n\n${content}\n\nอ่านเพิ่มเติม: ${activityUrl}`;
    
    return {
      line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(activityUrl)}&text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(activityUrl)}`,
      messenger: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(activityUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(activityUrl)}`
    };
  };

  const handleShare = (activityItem: ActivityItem, platform: 'line' | 'facebook' | 'messenger') => {
    const links = generateShareLinks(activityItem);
    const shareUrl = links[platform];
    
    if (platform === 'facebook') {
      // Try to open Facebook share dialog
      const facebookWindow = window.open(shareUrl, '_blank', 'width=600,height=400');
      
      // Check if popup was blocked
      setTimeout(() => {
        if (!facebookWindow || facebookWindow.closed) {
          // Fallback: copy link to clipboard
          const activityUrl = `https://www.bankhodonkan.ac.th/#activity-detail-${activityItem.id}`;
          navigator.clipboard.writeText(activityUrl).then(() => {
            Swal.fire({
              title: "Facebook ถูกบล็อค",
              text: "ลิงค์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว คุณสามารถแชร์ด้วยตนเองได้",
              icon: "info",
              confirmButtonText: "ตกลง"
            });
          });
        }
      }, 1000);
    } else if (platform === 'messenger') {
      const messageText = `${activityItem.title}\n\n${activityItem.content.substring(0, 100)}${activityItem.content.length > 100 ? '...' : ''}\n\nอ่านเพิ่มเติม: ${window.location.origin}#activities`;
      const messengerUrl = `fb-messenger://share/?link=${encodeURIComponent(window.location.origin + '#activities')}&app_id=140586622674265`;
      
      const tempLink = document.createElement('a');
      tempLink.href = messengerUrl;
      tempLink.click();
      
      setTimeout(() => {
        window.open(`https://www.messenger.com/new`, '_blank');
      }, 1000);
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    toast({
      title: "แชร์สำเร็จ",
      description: `เปิดหน้าต่างแชร์ไปยัง ${platform === 'line' ? 'LINE' : platform === 'facebook' ? 'Facebook' : 'Messenger'} แล้ว`,
    });
  };

  const generateActivityUrl = (activityId?: string) => {
    const baseUrl = 'https://www.bankhodonkan.ac.th';
    return activityId ? `${baseUrl}/#activity-detail-${activityId}` : `${baseUrl}/#activities`;
  };

  const handleCopyLink = (activityId?: string) => {
    const activityUrl = generateActivityUrl(activityId);
    navigator.clipboard.writeText(activityUrl).then(() => {
      toast({
        title: "คัดลอกลิงค์สำเร็จ",
        description: "ลิงค์กิจกรรมถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      });
    }).catch(() => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกลิงค์ได้",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="space-y-8">
      <Card className="mb-8 bg-gradient-to-br from-green-100 to-white dark:from-green-900/20 dark:to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{editingId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}</CardTitle>
            {editingId && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetForm}
                className="text-sm"
              >
                ยกเลิกการแก้ไข
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="title">หัวข้อกิจกรรม</Label>
                <Textarea
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="กรอกหัวข้อกิจกรรม"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="author">ผู้จัดกิจกรรม</Label>
                <Input
                  id="author"
                  value={formData.author_name}
                  onChange={(e) => handleInputChange('author_name', e.target.value)}
                  placeholder="ชื่อผู้จัดกิจกรรม"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-images">รูปภาพกิจกรรม (สูงสุด {MAX_IMAGES} รูป)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  id="activity-images"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="activity-images"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">คลิกเพื่ออัพโหลดรูปภาพกิจกรรม</p>
                  <p className="text-xs text-gray-400">({imagePreviews.length}/{MAX_IMAGES} รูป · เลือกหลายรูปพร้อมกันได้ ระบบย่อขนาดให้อัตโนมัติ)</p>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className={`w-full h-32 object-cover rounded-lg ${
                            coverImageIndex === index ? 'ring-4 ring-primary' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCoverImageIndex(index)}
                          className={`absolute bottom-2 left-2 px-2 py-1 text-xs rounded ${
                            coverImageIndex === index
                              ? 'bg-primary text-white'
                              : 'bg-black/50 text-white hover:bg-black/70'
                          }`}
                        >
                          {coverImageIndex === index ? '✓ รูปปก' : 'ตั้งเป็นรูปปก'}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    * คลิกปุ่ม "ตั้งเป็นรูปปก" เพื่อเลือกรูปภาพที่จะแสดงเป็นปก
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">เนื้อหากิจกรรม</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="กรอกรายละเอียดกิจกรรม"
                rows={8}
                required
              />
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับ
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? (uploadProgress || "กำลังบันทึก...") : editingId ? "บันทึกการแก้ไข" : "บันทึกกิจกรรม"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการกิจกรรมทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingActivities ? (
            <div className="text-center py-8">กำลังโหลด...</div>
          ) : activitiesList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">ยังไม่มีกิจกรรม</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px]">หัวข้อ</TableHead>
                    <TableHead className="min-w-[150px]">ผู้จัดกิจกรรม</TableHead>
                    <TableHead className="min-w-[120px]">วันที่สร้าง</TableHead>
                    <TableHead className="min-w-[180px]">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activitiesList.map((activity) => {
                    const canManage = isAdmin || (!!currentUserId && activity.user_id === currentUserId);
                    return (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-primary">{activity.title}</div>
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {activity.content.substring(0, 100)}
                            {activity.content.length > 100 && '...'}
                          </div>
                          {activity.images && activity.images.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              <img 
                                src={activity.images[activity.cover_image_index || 0]} 
                                alt="Activity cover" 
                                className="w-16 h-16 object-cover rounded ring-2 ring-primary"
                              />
                              {activity.images.length > 1 && (
                                <div className="text-xs text-gray-500 flex items-center">
                                  +{activity.images.length - 1} รูป
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{activity.author_name}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(activity.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          {canManage && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(activity)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              แก้ไข
                            </Button>
                          )}
                          {canManage && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(activity.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                              ลบ
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(activity.id)}
                            className="flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            คัดลอกลิงค์
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare(activity, 'facebook')}
                            className="flex items-center gap-1"
                          >
                            <Share2 className="h-3 w-3" />
                            แชร์ Facebook
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivitiesForm;