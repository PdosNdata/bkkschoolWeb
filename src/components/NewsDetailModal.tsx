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
  const { toast } = useToast();

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

      onClose(); // Close modal after successful deletion
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {news && (
          <>
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">
                  {news.title}
                </DialogTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Cover Image */}
              {news.cover_image && (
                <div className="w-full">
                  <img
                    src={news.cover_image}
                    alt={news.title}
                    className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>ผู้เขียน: {news.author_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>วันที่เผยแพร่: {formatDate(news.published_date)}</span>
                </div>
                <Badge className={`${getCategoryColor(news.category)} border-0 text-xs`}>
                  {getCategoryName(news.category)}
                </Badge>
              </div>

              {/* Content */}
              <div className="prose max-w-none">
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {news.content}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleEdit(news)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  แก้ไข
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(news.id)}
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
  );
};

export default NewsDetailModal;