import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  if (!news) return null;

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
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={`${getCategoryColor(news.category)} border-0`}>
              {getCategoryName(news.category)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogTitle className="text-2xl font-bold text-left leading-tight">
            {news.title}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{news.author_name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(news.published_date)}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {news.cover_image && (
            <div className="w-full flex justify-center">
              <img
                src={news.cover_image}
                alt={news.title}
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: 'none' }}
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
              {news.content}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsDetailModal;