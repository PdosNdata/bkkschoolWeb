import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, User, MoreVertical, Edit2, Trash2, Share2, Copy, ExternalLink, Facebook } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MediaResource {
  id: string;
  title: string;
  author_name: string;
  published_date: string;
  description: string;
  media_url: string;
  media_type: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

interface MediaListProps {
  onEdit?: (media: MediaResource) => void;
  refreshTrigger?: number;
}

const MediaList = ({ onEdit, refreshTrigger }: MediaListProps) => {
  const [mediaList, setMediaList] = useState<MediaResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800 border-red-200';
      case 'website': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'document': return 'bg-green-100 text-green-800 border-green-200';
      case 'image': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMediaTypeText = (type: string) => {
    switch (type) {
      case 'video': return 'วิดีโอ';
      case 'website': return 'เว็บไซต์';
      case 'document': return 'เอกสาร';
      case 'image': return 'รูปภาพ';
      default: return type;
    }
  };

  const checkUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    return data?.role || null;
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('media_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaList(data || []);
      console.log('Fetched media:', data); // Debug log
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    console.log('Current user from auth:', user); // Debug log
    
    if (user) {
      const role = await checkUserRole(user.id);
      setUserRole(role);
      console.log('User role:', role); // Debug log
    }
  };

  useEffect(() => {
    fetchMedia();
    checkCurrentUser();
  }, [refreshTrigger]);

  // Debug logging
  useEffect(() => {
    console.log('Current user:', currentUser);
    console.log('User role:', userRole);
  }, [currentUser, userRole]);

  const canEditDelete = (media: MediaResource) => {
    if (!currentUser) return false;
    
    // Admin can edit/delete everything
    if (userRole === 'admin') return true;
    
    // Teachers can edit/delete everything (temporary until user_id is properly implemented)
    if (userRole === 'teacher') return true;
    
    return false;
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('media_resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "ลบสำเร็จ",
        description: "ลบข้อมูลสื่อเรียบร้อยแล้ว",
      });
      
      fetchMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลได้",
        variant: "destructive",
      });
    }
    setDeleteDialog(null);
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "คัดลอกแล้ว",
        description: "คัดลอกลิงค์เรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกลิงค์ได้",
        variant: "destructive",
      });
    }
  };

  const handleShareFacebook = (media: MediaResource) => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(media.media_url)}&quote=${encodeURIComponent(`${media.title} - ${media.description}`)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">กำลังโหลด...</div>
      </div>
    );
  }

  if (mediaList.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            ไม่มีข้อมูลสื่อออนไลน์
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {mediaList.map((media) => (
        <Card key={media.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{media.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{media.author_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(media.published_date), 'dd MMM yyyy', { locale: th })}</span>
                  </div>
                  <Badge className={getMediaTypeColor(media.media_type)}>
                    {getMediaTypeText(media.media_type)}
                  </Badge>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.open(media.media_url, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    เปิดลิงค์
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyLink(media.media_url)}>
                    <Copy className="w-4 h-4 mr-2" />
                    คัดลอกลิงค์
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShareFacebook(media)}>
                    <Facebook className="w-4 h-4 mr-2" />
                    แชร์ Facebook
                  </DropdownMenuItem>
                  {canEditDelete(media) && (
                    <>
                      <Separator className="my-1" />
                      <DropdownMenuItem onClick={() => onEdit?.(media)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        แก้ไข
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteDialog(media.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        ลบ
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {media.description}
            </p>
            
            {media.thumbnail_url && (
              <div className="mt-4">
                <img 
                  src={media.thumbnail_url} 
                  alt={media.title}
                  className="w-full max-w-sm h-32 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบข้อมูลสื่อนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MediaList;