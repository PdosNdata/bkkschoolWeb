import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

const NewsSection = () => {
  const news = [
    {
      title: "เปิดรับสมัครนักเรียนปีการศึกษา 2568",
      summary: "โรงเรียนบ้านค้อดอนแคนเปิดรับสมัครนักเรียนใหม่สำหรับปีการศึกษา 2568 ทุกระดับชั้น",
      date: "15 ม.ค. 2568",
      category: "ประกาศ",
      urgent: true
    },
    {
      title: "กิจกรรมวันภาษาไทยแห่งชาติ",
      summary: "จัดงานวันภาษาไทยแห่งชาติ ประจำปี 2567 เพื่อเชิดชูและอนุรักษ์ภาษาไทย",
      date: "28 ก.ค. 2567",
      category: "กิจกรรม",
      urgent: false
    },
    {
      title: "ผลการแข่งขันโครงงานวิทยาศาสตร์",
      summary: "นักเรียนได้รับรางวัลชนะเลิศการแข่งขันโครงงานวิทยาศาสตร์ระดับจังหวัด",
      date: "20 ก.ค. 2567",
      category: "รางวัล",
      urgent: false
    },
    {
      title: "โครงการพัฒนาห้องเรียนดิจิทัล",
      summary: "เริ่มดำเนินโครงการปรับปรุงห้องเรียนให้ทันสมัย พร้อมเทคโนโลยีการเรียนรู้",
      date: "10 ก.ค. 2567",
      category: "พัฒนา",
      urgent: false
    },
    {
      title: "การฝึกอบรมครูด้านเทคโนโลยี",
      summary: "จัดอบรมครูและบุคลากรเพื่อพัฒนาทักษะการใช้เทคโนโลยีในการจัดการเรียนรู้",
      date: "5 ก.ค. 2567",
      category: "อบรม",
      urgent: false
    },
    {
      title: "กิจกรรมปลูกป่าเฉลิมพระเกียรติ",
      summary: "นักเรียนและครูร่วมกิจกรรมปลูกป่าเพื่อสิ่งแวดล้อมที่ยั่งยืน",
      date: "1 ก.ค. 2567",
      category: "สิ่งแวดล้อม",
      urgent: false
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "ประกาศ": "bg-red-100 text-red-800",
      "กิจกรรม": "bg-blue-100 text-blue-800",
      "รางวัล": "bg-yellow-100 text-yellow-800",
      "พัฒนา": "bg-green-100 text-green-800",
      "อบรม": "bg-purple-100 text-purple-800",
      "สิ่งแวดล้อม": "bg-emerald-100 text-emerald-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <section id="news" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Newspaper className="w-4 h-4 mr-2" />
            ข่าวสาร
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ข่าวสารและประกาศล่าสุด
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ติดตามข่าวสาร กิจกรรม และประกาศสำคัญต่าง ๆ 
            ของโรงเรียนบ้านค้อดอนแคนได้ที่นี่
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {news.map((item, index) => (
            <Card 
              key={index} 
              className={`bg-white border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group ${
                item.urgent ? 'ring-2 ring-red-200' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    className={`${getCategoryColor(item.category)} border-0`}
                  >
                    {item.category}
                  </Badge>
                  {item.urgent && (
                    <Badge variant="destructive" className="text-xs">
                      ด่วน!
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                  {item.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {item.date}
                  </div>
                  {item.title === "เปิดรับสมัครนักเรียนปีการศึกษา 2568" ? (
                    <Link to="/admission">
                      <Button variant="ghost" size="sm" className="p-0 h-auto hover:text-primary">
                        <span className="mr-1">อ่านต่อ</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:text-primary">
                      <span className="mr-1">อ่านต่อ</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-card rounded-2xl p-8 md:p-12 text-center border shadow-elegant">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              ติดตามข่าวสารจากเรา
            </h3>
            <p className="text-muted-foreground text-lg mb-8">
              สมัครรับข่าวสารและกิจกรรมใหม่ ๆ ของโรงเรียนส่งตรงถึงอีเมลของคุณ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="อีเมลของคุณ"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button variant="default" size="lg">
                สมัครรับข่าวสาร
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;