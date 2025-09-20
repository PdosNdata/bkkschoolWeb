import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, X, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Swal from "sweetalert2";

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
  const { toast } = useToast();

  // Remove unused state since we're not showing the list anymore
  // const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  // const [showDetailView, setShowDetailView] = useState(false);

  // Remove unused functions since we're not fetching list anymore
  // const fetchAllActivities = async () => { ... }

  const handleEdit = (activityItem: Activity) => {
    // Navigate to activities form page with edit mode
    window.location.href = `/activities-form?edit=${activityItem.id}`;
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

      // Close the modal after successful deletion
      onClose();
    } catch (error) {
      console.error('Error deleting activity:', error);
      await Swal.fire(
        'เกิดข้อผิดพลาด!',
        'ไม่สามารถลบกิจกรรมได้',
        'error'
      );
    }
  };

  // Remove unused functions since we're going directly to detail view
  // const handleViewDetail = (activityItem: Activity) => { ... }
  // const handleCloseDetailView = () => { ... }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = (activityItem: Activity, platform: 'facebook' | 'line') => {
    const baseUrl = 'https://www.bankhodonkan.ac.th';
    const activityUrl = `${baseUrl}/#activity-detail-${activityItem.id}`;
    const title = activityItem.title;
    const content = activityItem.content.substring(0, 100) + (activityItem.content.length > 100 ? '...' : '');
    const shareText = `${title}\n\n${content}\n\nอ่านเพิ่มเติม: ${activityUrl}`;
    
    let shareUrl = '';
    
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(activityUrl)}&quote=${encodeURIComponent(shareText)}`;
    } else {
      shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(activityUrl)}&text=${encodeURIComponent(shareText)}`;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    toast({
      title: "แชร์สำเร็จ",
      description: `เปิดหน้าต่างแชร์ไปยัง ${platform === 'facebook' ? 'Facebook' : 'LINE'} แล้ว`,
    });
  };

  const handleCopyLink = (activityItem: Activity) => {
    const baseUrl = 'https://www.bankhodonkan.ac.th';
    const activityUrl = `${baseUrl}/#activity-detail-${activityItem.id}`;
    
    navigator.clipboard.writeText(activityUrl).then(() => {
      toast({
        title: "คัดลอกลิงค์สำเร็จ",
        description: "ลิงค์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      });
    }).catch(() => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกลิงค์ได้",
        variant: "destructive"
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {activity && (
          <>
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">
                  {activity.title}
                </DialogTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Cover Image */}
              {activity.cover_image && (
                <div className="w-full">
                  <img
                    src={activity.cover_image}
                    alt={activity.title}
                    className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md bg-gray-50"
                  />
                </div>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>ผู้เขียน: {activity.author_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>วันที่: {formatDate(activity.created_at)}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  กิจกรรม
                </Badge>
              </div>

              {/* Content */}
              <div className="prose max-w-none">
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {activity.content}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleCopyLink(activity)}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  คัดลอกลิงค์
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare(activity, 'facebook')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Share2 className="w-4 h-4" />
                  แชร์ Facebook
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActivitiesDetailModal;