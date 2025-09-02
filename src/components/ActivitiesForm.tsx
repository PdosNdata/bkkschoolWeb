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
import { ArrowLeft, Upload, Edit, Trash2, Share2, Copy, Link } from "lucide-react";
import Swal from "sweetalert2";

interface ActivitiesFormData {
  title: string;
  content: string;
  author_name: string;
  cover_image?: string;
}

interface ActivityItem {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  cover_image?: string;
}

interface ActivitiesFormProps {
  onActivityAdded?: () => void;
}

const ActivitiesForm = ({ onActivityAdded }: ActivitiesFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [activitiesList, setActivitiesList] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ActivitiesFormData>({
    title: "",
    content: "",
    author_name: "",
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
    fetchAllActivities();
  }, []);

  const fetchAllActivities = async () => {
    try {
      setLoadingActivities(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
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
      let coverImageUrl = formData.cover_image || "";
      
      // Upload image if selected
      if (coverImage) {
        const imageUrl = await uploadImage(coverImage);
        if (imageUrl) {
          coverImageUrl = imageUrl;
        }
      }

      if (editingId) {
        // Update existing activity
        const { error } = await supabase
          .from('activities')
          .update({
            ...formData,
            cover_image: coverImageUrl || null
          })
          .eq('id', editingId);

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
        const { error } = await supabase
          .from('activities')
          .insert([{
            ...formData,
            cover_image: coverImageUrl || null
          }]);

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
      toast({
        title: "เกิดข้อผิดพลาด",
        description: editingId ? "ไม่สามารถแก้ไขกิจกรรมได้" : "ไม่สามารถเพิ่มกิจกรรมได้",
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
    });
    setCoverImage(null);
    setImagePreview("");
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
      cover_image: activityItem.cover_image
    });
    
    // Set image preview if activity has cover image
    if (activityItem.cover_image) {
      setImagePreview(activityItem.cover_image);
    }

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
    const baseUrl = window.location.origin;
    const activityUrl = `${baseUrl}/#activity-detail-${activityItem.id}`;
    const title = activityItem.title;
    const content = activityItem.content.substring(0, 100) + (activityItem.content.length > 100 ? '...' : '');
    const shareText = `${title}\n\n${content}\n\nอ่านเพิ่มเติม: ${activityUrl}`;
    
    return {
      line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(activityUrl)}&text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(activityUrl)}&quote=${encodeURIComponent(shareText)}`,
      messenger: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(activityUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(activityUrl)}`
    };
  };

  const handleShare = (activityItem: ActivityItem, platform: 'line' | 'facebook' | 'messenger') => {
    const links = generateShareLinks(activityItem);
    const shareUrl = links[platform];
    
    if (platform === 'messenger') {
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
    const baseUrl = window.location.origin;
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
                      <p className="text-sm text-gray-500">คลิกเพื่ออัพโหลดรูปภาพปก</p>
                    </>
                  )}
                </label>
              </div>
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
                {uploading ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "บันทึกกิจกรรม"}
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
                  {activitiesList.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium line-clamp-2">{activity.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {activity.content.substring(0, 100)}
                            {activity.content.length > 100 && "..."}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{activity.author_name}</TableCell>
                      <TableCell>{formatDate(activity.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(activity)}
                            className="h-8 px-2"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(activity.id)}
                            className="h-8 px-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(activity.id)}
                            className="h-8 px-2"
                          >
                            <Link className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare(activity, 'facebook')}
                            className="h-8 px-2 text-blue-600"
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
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

export default ActivitiesForm;