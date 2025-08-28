import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Edit, Trash2, Share2, Copy, Link } from "lucide-react";
import Swal from "sweetalert2";

interface NewsFormData {
  title: string;
  content: string;
  author_name: string;
  category: string;
  published_date: string;
  cover_image?: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category: string;
  published_date: string;
  created_at: string;
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
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
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
    fetchAllNews();
  }, []);

  const fetchAllNews = async () => {
    try {
      setLoadingNews(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) throw error;
      setNewsList(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลข่าวสารได้",
        variant: "destructive",
      });
    } finally {
      setLoadingNews(false);
    }
  };

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
      let coverImageUrl = formData.cover_image || "";
      
      // Upload image if selected
      if (coverImage) {
        const imageUrl = await uploadImage(coverImage);
        if (imageUrl) {
          coverImageUrl = imageUrl;
        }
      }

      if (editingId) {
        // Update existing news
        const { error } = await supabase
          .from('news')
          .update({
            ...formData,
            cover_image: coverImageUrl || null
          })
          .eq('id', editingId);

        if (error) throw error;

        Swal.fire({
          title: "สำเร็จ!",
          text: "แก้ไขข่าวสารเรียบร้อยแล้ว",
          icon: "success",
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      } else {
        // Insert new news
        const { error } = await supabase
          .from('news')
          .insert([{
            ...formData,
            cover_image: coverImageUrl || null
          }]);

        if (error) throw error;

        Swal.fire({
          title: "สำเร็จ!",
          text: "เพิ่มข่าวสารใหม่แล้ว",
          icon: "success",
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }

      // Reset form
      resetForm();
      
      // Call callback to refresh news list
      onNewsAdded?.();
      fetchAllNews(); // Refresh the news list
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: editingId ? "ไม่สามารถแก้ไขข่าวสารได้" : "ไม่สามารถเพิ่มข่าวสารได้",
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
      category: "general",
      published_date: new Date().toISOString().split('T')[0],
    });
    setCoverImage(null);
    setImagePreview("");
    setEditingId(null);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "general": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
      "academic": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      "activity": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      "announcement": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      "general": "ทั่วไป",
      "academic": "วิชาการ", 
      "activity": "กิจกรรม",
      "announcement": "ประกาศ",
    };
    return names[category] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEdit = (newsItem: NewsItem) => {
    setEditingId(newsItem.id);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      author_name: newsItem.author_name,
      category: newsItem.category,
      published_date: newsItem.published_date,
      cover_image: newsItem.cover_image
    });
    
    // Set image preview if news has cover image
    if (newsItem.cover_image) {
      setImagePreview(newsItem.cover_image);
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast({
      title: "โหลดข้อมูลแล้ว",
      description: "สามารถแก้ไขข้อมูลในฟอร์มด้านบนได้เลย",
    });
  };

  const handleDelete = async (newsId: string) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการลบข่าวนี้หรือไม่?",
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
        .from('news')
        .delete()
        .eq('id', newsId);

      if (error) throw error;

      await Swal.fire(
        'ลบสำเร็จ!',
        'ข่าวสารถูกลบเรียบร้อยแล้ว',
        'success'
      );

      fetchAllNews(); // Refresh the list
    } catch (error) {
      console.error('Error deleting news:', error);
      await Swal.fire(
        'เกิดข้อผิดพลาด!',
        'ไม่สามารถลบข่าวสารได้',
        'error'
      );
    }
  };

  const generateShareLinks = (newsItem: NewsItem) => {
    const baseUrl = window.location.origin;
    const newsUrl = `${baseUrl}#news`;
    const title = newsItem.title;
    const content = newsItem.content.substring(0, 100) + (newsItem.content.length > 100 ? '...' : '');
    const shareText = `${title}\n\n${content}\n\nอ่านเพิ่มเติม: ${newsUrl}`;
    
    return {
      line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(newsUrl)}&text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(newsUrl)}&quote=${encodeURIComponent(shareText)}`,
      messenger: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(newsUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(newsUrl)}`
    };
  };

  const handleShare = (newsItem: NewsItem, platform: 'line' | 'facebook' | 'messenger') => {
    const links = generateShareLinks(newsItem);
    const shareUrl = links[platform];
    
    if (platform === 'messenger') {
      // For Messenger, we'll use a simpler approach
      const messageText = `${newsItem.title}\n\n${newsItem.content.substring(0, 100)}${newsItem.content.length > 100 ? '...' : ''}\n\nอ่านเพิ่มเติม: ${window.location.origin}#news`;
      const messengerUrl = `fb-messenger://share/?link=${encodeURIComponent(window.location.origin + '#news')}&app_id=140586622674265`;
      
      // Try to open messenger app, fallback to web
      const tempLink = document.createElement('a');
      tempLink.href = messengerUrl;
      tempLink.click();
      
      // Fallback for web
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

  const generateNewsUrl = (newsId?: string) => {
    const baseUrl = window.location.origin;
    return newsId ? `${baseUrl}/#news-${newsId}` : `${baseUrl}/#news`;
  };

  const handleCopyLink = (newsId?: string) => {
    const newsUrl = generateNewsUrl(newsId);
    navigator.clipboard.writeText(newsUrl).then(() => {
      toast({
        title: "คัดลอกลิงค์สำเร็จ",
        description: "ลิงค์ข่าวสารถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
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
      <Card className="mb-8 bg-gradient-to-br from-purple-100 to-white dark:from-purple-900/20 dark:to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{editingId ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสารและประกาศใหม่"}</CardTitle>
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
                <Label htmlFor="title">หัวข้อข่าว</Label>
                <Textarea
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="กรอกหัวข้อข่าว"
                  rows={3}
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
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(editingId)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  คัดลอกลิงค์
                </Button>
              )}
              <Button 
                type="submit" 
                size="sm"
                disabled={uploading}
              >
                {uploading ? "กำลังบันทึก..." : editingId ? "อัพเดต" : "บันทึก"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* News List Section */}
      <Card>
        <CardHeader>
          <CardTitle>รายการข่าวสารและประกาศล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingNews ? (
            <div className="text-center py-8">
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">หัวข้อ</TableHead>
                    <TableHead className="w-[400px]">รายละเอียด</TableHead>
                    <TableHead className="w-[150px]">ผู้เขียน</TableHead>
                    <TableHead className="w-[150px]">วันที่</TableHead>
                    <TableHead className="w-[100px]">หมวดหมู่</TableHead>
                    <TableHead className="w-[200px] text-center">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        ไม่มีข่าวสาร
                      </TableCell>
                    </TableRow>
                  ) : (
                    newsList.map((newsItem) => (
                      <TableRow key={newsItem.id}>
                        <TableCell className="font-medium">
                          <div className="line-clamp-2" title={newsItem.title}>
                            {newsItem.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="line-clamp-3 text-sm text-muted-foreground" title={newsItem.content}>
                            {newsItem.content}
                          </div>
                        </TableCell>
                        <TableCell>{newsItem.author_name}</TableCell>
                        <TableCell>{formatDate(newsItem.published_date)}</TableCell>
                        <TableCell>
                          <Badge className={`${getCategoryColor(newsItem.category)} border-0 text-xs`}>
                            {getCategoryName(newsItem.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(newsItem)}
                              className="h-8 w-8 p-0"
                              title="แก้ไข"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(newsItem.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyLink(newsItem.id)}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                              title="คัดลอกลิงค์"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            
                            {/* Share buttons */}
                            <div className="flex items-center gap-1 ml-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShare(newsItem, 'line')}
                                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                                title="แชร์ไปยัง LINE"
                              >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.839 4.327 8.894 10.172 9.614.396.085.934.258 1.07.593.123.302.081.78.04 1.104l-.172 1.028c-.052.31-.244 1.212 1.061.661 1.304-.55 7.049-4.148 9.618-7.096 1.775-1.749 2.211-3.523 2.211-5.968z"/>
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShare(newsItem, 'facebook')}
                                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                                title="แชร์ไปยัง Facebook"
                              >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShare(newsItem, 'messenger')}
                                className="h-6 w-6 p-0 text-blue-500 hover:text-blue-600"
                                title="แชร์ไปยัง Messenger"
                              >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.26 5.889-3.26-6.56 6.963z"/>
                                </svg>
                              </Button>
                            </div>
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

export default NewsForm;