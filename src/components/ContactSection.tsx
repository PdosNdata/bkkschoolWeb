import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ImageIcon, 
  Video, 
  FileText, 
  Download,
  Eye,
  PlayCircle
} from "lucide-react";

const ContactSection = () => {
  const mediaItems = [
    {
      id: 1,
      title: "วิดีโอแนะนำโรงเรียน",
      type: "video",
      thumbnail: "https://i.postimg.cc/4xq2y2X8/video-thumb.jpg",
      description: "วิดีโอแนะนำสิ่งอำนวยความสะดวกและกิจกรรมต่างๆ ของโรงเรียน"
    },
    {
      id: 2,
      title: "รูปภาพกิจกรรมนักเรียน",
      type: "image",
      thumbnail: "https://i.postimg.cc/13zQ7k8V/activity-gallery.jpg",
      description: "คลังภาพกิจกรรมต่างๆ ที่นักเรียนได้เข้าร่วม"
    },
    {
      id: 3,
      title: "เอกสารคู่มือนักเรียน",
      type: "document",
      thumbnail: "https://i.postimg.cc/DyWBY8yH/document-thumb.jpg",
      description: "คู่มือและเอกสารสำคัญสำหรับนักเรียนและผู้ปกครอง"
    },
    {
      id: 4,
      title: "ภาพถ่ายมุมสวยโรงเรียน",
      type: "image",
      thumbnail: "https://i.postimg.cc/7Zw1y2Kx/school-beauty.jpg",
      description: "ภาพถ่ายมุมต่างๆ ภายในโรงเรียนที่สวยงาม"
    },
    {
      id: 5,
      title: "วิดีโอการเรียนการสอน",
      type: "video",
      thumbnail: "https://i.postimg.cc/4xq2y2X8/teaching-video.jpg",
      description: "วิดีโอแสดงรูปแบบการเรียนการสอนของโรงเรียน"
    },
    {
      id: 6,
      title: "แบบฟอร์มต่างๆ",
      type: "document",
      thumbnail: "https://i.postimg.cc/DyWBY8yH/forms-thumb.jpg",
      description: "แบบฟอร์มสำหรับการสมัครเรียนและเอกสารต่างๆ"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-6 h-6 text-white" />;
      case 'image':
        return <ImageIcon className="w-6 h-6 text-white" />;
      case 'document':
        return <FileText className="w-6 h-6 text-white" />;
      default:
        return <FileText className="w-6 h-6 text-white" />;
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mediaItems.map((item) => (
            <Card key={item.id} className="bg-white border-0 shadow-elegant overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    {getIcon(item.type)}
                  </div>
                </div>
                {item.type === 'video' && (
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
                <p className="text-muted-foreground text-sm mb-4">
                  {item.description}
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    ดู
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    ดาวน์โหลด
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;