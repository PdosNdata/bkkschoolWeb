import { useState, useEffect } from "react";
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

// One vivid colour family per media type (full class strings for Tailwind)
const MEDIA_THEMES: Record<string, { border: string; tint: string; title: string; btn: string; glow: string; outline: string }> = {
  video: { border: "from-rose-400 via-red-500 to-orange-500", tint: "from-rose-50 to-white", title: "text-rose-700", btn: "from-rose-500 to-red-600", glow: "shadow-rose-400/40", outline: "border-rose-300 text-rose-600 hover:bg-rose-50" },
  image: { border: "from-emerald-400 via-green-500 to-teal-500", tint: "from-emerald-50 to-white", title: "text-emerald-700", btn: "from-emerald-500 to-teal-600", glow: "shadow-emerald-400/40", outline: "border-emerald-300 text-emerald-600 hover:bg-emerald-50" },
  document: { border: "from-sky-400 via-blue-500 to-indigo-500", tint: "from-sky-50 to-white", title: "text-blue-700", btn: "from-sky-500 to-blue-600", glow: "shadow-blue-400/40", outline: "border-blue-300 text-blue-600 hover:bg-blue-50" },
  website: { border: "from-violet-400 via-purple-500 to-fuchsia-500", tint: "from-violet-50 to-white", title: "text-purple-700", btn: "from-violet-500 to-purple-600", glow: "shadow-purple-400/40", outline: "border-purple-300 text-purple-600 hover:bg-purple-50" },
};

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
    // แชร์ลิงค์หน้าเว็บปัจจุบันแทนที่จะเป็น media_url
    const currentPageUrl = window.location.href;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentPageUrl)}`;
    const popup = window.open(shareUrl, 'facebook-share', 'width=600,height=400,scrollbars=yes,resizable=yes');
    
    // ถ้า Facebook ยังบล็อค ให้คัดลอกลิงค์แทน
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
      handleCopyLink(item);
      alert('ไม่สามารถเปิด Facebook ได้ ลิงค์ถูกคัดลอกไว้ให้แล้ว');
    }
  };

  const handleCopyLink = async (item: MediaResource) => {
    try {
      // คัดลอกลิงค์หน้าเว็บปัจจุบันแทนที่จะเป็น media_url
      const currentPageUrl = window.location.href;
      await navigator.clipboard.writeText(currentPageUrl);
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
            {mediaResources.map((item) => {
              const t = MEDIA_THEMES[item.media_type] ?? MEDIA_THEMES.document;
              return (
                <div
                  key={item.id}
                  className={`group flex flex-col rounded-2xl bg-gradient-to-br ${t.border} p-[3px] shadow-lg ${t.glow} transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                >
                  <div className={`flex h-full flex-col overflow-hidden rounded-[0.85rem] bg-gradient-to-b ${t.tint}`}>
                    <div className="relative h-48 overflow-hidden">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${t.border}`}>
                          <span className="[&>svg]:h-14 [&>svg]:w-14 [&>svg]:drop-shadow">{getIcon(item.media_type)}</span>
                        </div>
                      )}
                      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
                      <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${t.btn} px-3 py-1 text-xs font-bold text-white shadow`}>
                        <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{getIcon(item.media_type)}</span>
                        {getTypeLabel(item.media_type)}
                      </span>
                      {item.media_type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/30 ring-2 ring-white/70 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                            <PlayCircle className="h-9 w-9 text-white drop-shadow" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className={`mb-2 line-clamp-2 text-lg font-bold leading-snug ${t.title}`}>{item.title}</h3>
                      <p className="mb-2 text-xs text-gray-600">
                        โดย: {item.author_name} | {new Date(item.published_date).toLocaleDateString('th-TH')}
                      </p>
                      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-700">{item.description}</p>
                      <div className="mt-auto flex gap-2">
                        <Button
                          size="sm"
                          className={`flex-1 rounded-full border-0 bg-gradient-to-r ${t.btn} font-semibold text-white shadow-md hover:opacity-90 hover:shadow-lg`}
                          onClick={() => openMedia(item.media_url)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          เปิดดู
                        </Button>
                        <Button variant="outline" size="icon" className={`rounded-full ${t.outline}`} onClick={() => handleShareFacebook(item)} title="แชร์ Facebook" aria-label="แชร์ Facebook">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className={`rounded-full ${t.outline}`} onClick={() => handleCopyLink(item)} title="คัดลอกลิงก์" aria-label="คัดลอกลิงก์">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactSection;