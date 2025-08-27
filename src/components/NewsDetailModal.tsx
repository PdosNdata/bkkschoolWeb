import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, X, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Swal from "sweetalert2";

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

interface NewsDetailModalProps {
  news: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const NewsDetailModal = ({ news, isOpen, onClose }: NewsDetailModalProps) => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchAllNews();
    }
  }, [isOpen]);

  const fetchAllNews = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handleEdit = (newsItem: NewsItem) => {
    // TODO: Implement edit functionality
    toast({
      title: "ฟีเจอร์แก้ไข",
      description: "ฟีเจอร์แก้ไขจะเพิ่มในเร็วๆ นี้",
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

  const handleViewDetail = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setShowDetailView(true);
  };

  const handleCloseDetailView = () => {
    setShowDetailView(false);
    setSelectedNews(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Dialog open={isOpen && !showDetailView} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                รายการข่าวสารและประกาศล่าสุด
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">หัวข้อ</TableHead>
                      <TableHead className="w-[350px]">รายละเอียด</TableHead>
                      <TableHead className="w-[120px]">ผู้เขียน</TableHead>
                      <TableHead className="w-[120px]">วันที่</TableHead>
                      <TableHead className="w-[80px]">หมวดหมู่</TableHead>
                      <TableHead className="w-[140px] text-center">การจัดการ</TableHead>
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
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(newsItem)}
                                className="h-8 w-8 p-0"
                                title="ดูรายละเอียด"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* News Detail View Dialog */}
      <Dialog open={showDetailView} onOpenChange={handleCloseDetailView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DialogHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold">
                    {selectedNews.title}
                  </DialogTitle>
                  <Button variant="ghost" size="sm" onClick={handleCloseDetailView}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Cover Image */}
                {selectedNews.cover_image && (
                  <div className="w-full">
                    <img
                      src={selectedNews.cover_image}
                      alt={selectedNews.title}
                      className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>ผู้เขียน: {selectedNews.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>วันที่เผยแพร่: {formatDate(selectedNews.published_date)}</span>
                  </div>
                  <Badge className={`${getCategoryColor(selectedNews.category)} border-0 text-xs`}>
                    {getCategoryName(selectedNews.category)}
                  </Badge>
                </div>

                {/* Content */}
                <div className="prose max-w-none">
                  <div className="text-base leading-relaxed whitespace-pre-wrap">
                    {selectedNews.content}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(selectedNews)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedNews.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    ลบ
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewsDetailModal;