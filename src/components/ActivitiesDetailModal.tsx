import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, X, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    // TODO: Implement edit functionality
    toast({
      title: "ฟีเจอร์แก้ไข",
      description: "ฟีเจอร์แก้ไขจะเพิ่มในเร็วๆ นี้",
    });
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้?')) return;

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "ลบกิจกรรมเรียบร้อยแล้ว",
      });

      fetchAllActivities(); // Refresh the list
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบกิจกรรมได้",
        variant: "destructive",
      });
    }
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
                    <TableHead className="w-[300px]">หัวข้อ</TableHead>
                    <TableHead className="w-[400px]">รายละเอียด</TableHead>
                    <TableHead className="w-[150px]">ผู้เขียน</TableHead>
                    <TableHead className="w-[150px]">วันที่</TableHead>
                    <TableHead className="w-[100px]">หมวดหมู่</TableHead>
                    <TableHead className="w-[120px] text-center">การจัดการ</TableHead>
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
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(activityItem)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(activityItem.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
  );
};

export default ActivitiesDetailModal;