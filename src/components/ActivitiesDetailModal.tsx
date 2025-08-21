import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Activity {
  id: string;
  title: string;
  content: string;
  author_name: string;
  cover_image?: string;
  created_at: string;
}

interface ActivitiesDetailModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

const ActivitiesDetailModal = ({ activity, isOpen, onClose }: ActivitiesDetailModalProps) => {
  if (!activity) return null;

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
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-0 top-0 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="pr-8">
            <Badge variant="secondary" className="mb-2">
              กิจกรรม
            </Badge>
            <DialogTitle className="text-2xl font-bold text-left leading-tight">
              {activity.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {activity.cover_image && (
            <div className="w-full flex justify-center">
              <img
                src={activity.cover_image}
                alt={activity.title}
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: 'none' }}
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>{activity.author_name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(activity.created_at)}</span>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
              {activity.content}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivitiesDetailModal;