import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ImageIcon, 
  Video, 
  FileText, 
  Download,
  Eye,
  PlayCircle,
  ExternalLink,
  Globe,
  Share2,
  Copy
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface MediaResource {
  id: string;
  title: string;
  author_name: string;
  published_date: string;
  description: string;
  media_url: string;
  media_type: 'video' | 'website' | 'document' | 'image';
  thumbnail_url?: string;
}

const ContactSection = () => {
  const [mediaResources, setMediaResources] = useState<MediaResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMediaResources();
  }, []);

  const fetchMediaResources = async () => {
    try {
      const { data, error } = await supabase
        .from('media_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMediaResources((data || []) as MediaResource[]);
    } catch (error) {
      console.error('Error fetching media resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-6 h-6 text-white" />;
      case 'image':
        return <ImageIcon className="w-6 h-6 text-white" />;
      case 'document':
        return <FileText className="w-6 h-6 text-white" />;
      case 'website':
        return <Globe className="w-6 h-6 text-white" />;
      default:
        return <FileText className="w-6 h-6 text-white" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'วิดีโอ';
      case 'image':
        return 'รูปภาพ';
      case 'document':
        return 'เอกสาร';
      case 'website':
        return 'เว็บไซต์';
      default:
        return 'ไฟล์';
    }
  };

  const openMedia = (url: string) => {
    window.open(url, '_blank');
  };

  const handleShareFacebook = (item: MediaResource) => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(item.media_url)}&quote=${encodeURIComponent(item.title)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async (item: MediaResource) => {
    try {
      await navigator.clipboard.writeText(item.media_url);
      // You can add a toast notification here if needed
      console.log('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };

  if (isLoading) {
    return (
      <section id="media" className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="media" className="py-20 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <ImageIcon className="w-4 h-4 mr-2" />
            สื่อออนไลน์
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            คลังสื่อออนไลน์
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            รวบรวมสื่อการเรียนรู้ ภาพถ่าย วิดีโอ และเอกสารต่างๆ
            ของโรงเรียนบ้านค้อดอนแคน
          </p>
        </div>

        {mediaResources.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">ยังไม่มีข้อมูลสื่อออนไลน์</h3>
            <p className="text-muted-foreground">รอการเพิ่มข้อมูลจากครูผู้สอน</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mediaResources.map((item) => (
              <Card key={item.id} className="bg-white border-0 shadow-elegant overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {getIcon(item.media_type)}
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      {getIcon(item.media_type)}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="text-xs">
                      {getTypeLabel(item.media_type)}
                    </Badge>
                  </div>
                  {item.media_type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                        <PlayCircle className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    โดย: {item.author_name} | {new Date(item.published_date).toLocaleDateString('th-TH')}
                  </p>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openMedia(item.media_url)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      เปิดดู
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShareFacebook(item)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyLink(item)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactSection;