import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, X, Edit, Trash2, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
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
  const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchAllActivities();
    }
  }, [isOpen]);

  const fetchAllActivities = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

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

  const handleViewDetail = (activityItem: Activity) => {
    setSelectedActivity(activityItem);
    setShowDetailView(true);
  };

  const handleCloseDetailView = () => {
    setShowDetailView(false);
    setSelectedActivity(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = (activityItem: Activity, platform: 'facebook' | 'line') => {
    const baseUrl = window.location.origin;
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

  return (
    <>
      <Dialog open={isOpen && !showDetailView} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                รายการกิจกรรมล่าสุด
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
                    {activitiesList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          ไม่มีกิจกรรม
                        </TableCell>
                      </TableRow>
                    ) : (
                      activitiesList.map((activityItem) => (
                        <TableRow key={activityItem.id}>
                          <TableCell className="font-medium">
                            <div className="line-clamp-2" title={activityItem.title}>
                              {activityItem.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="line-clamp-3 text-sm text-muted-foreground" title={activityItem.content}>
                              {activityItem.content}
                            </div>
                          </TableCell>
                          <TableCell>{activityItem.author_name}</TableCell>
                          <TableCell>{formatDate(activityItem.created_at)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              กิจกรรม
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(activityItem)}
                                className="h-8 w-8 p-0"
                                title="ดูรายละเอียด"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(activityItem)}
                                className="h-8 w-8 p-0"
                                title="แก้ไข"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShare(activityItem, 'facebook')}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                title="แชร์ไปยัง Facebook"
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(activityItem.id)}
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

      {/* Activity Detail View Dialog */}
      <Dialog open={showDetailView} onOpenChange={handleCloseDetailView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedActivity && (
            <>
              <DialogHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold">
                    {selectedActivity.title}
                  </DialogTitle>
                  <Button variant="ghost" size="sm" onClick={handleCloseDetailView}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Cover Image */}
                {selectedActivity.cover_image && (
                  <div className="w-full">
                    <img
                      src={selectedActivity.cover_image}
                      alt={selectedActivity.title}
                      className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md bg-gray-50"
                    />
                  </div>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>ผู้เขียน: {selectedActivity.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>วันที่: {formatDate(selectedActivity.created_at)}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    กิจกรรม
                  </Badge>
                </div>

                {/* Content */}
                <div className="prose max-w-none">
                  <div className="text-base leading-relaxed whitespace-pre-wrap">
                    {selectedActivity.content}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(selectedActivity)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare(selectedActivity, 'facebook')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Share2 className="w-4 h-4" />
                    แชร์ Facebook
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedActivity.id)}
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

export default ActivitiesDetailModal;