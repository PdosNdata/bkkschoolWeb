import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Music, Trophy, Microscope, Calculator, BookOpen, Users, Gamepad2 } from "lucide-react";
const ActivitiesSection = () => {
  const activities = [{
    icon: Palette,
    title: "ศิลปะและงานฝีมือ",
    description: "พัฒนาความคิดสร้างสรรค์ผ่านกิจกรรมศิลปะและงานฝีมือหลากหลาย",
    category: "ศิลปะ",
    gradient: "bg-gradient-arts"
  }, {
    icon: Music,
    title: "ดนตรีและการแสดง",
    description: "ฝึกฝนทักษะดนตรี การร้องเพลง และการแสดงเพื่อความมั่นใจ",
    category: "ดนตรี",
    gradient: "bg-gradient-music"
  }, {
    icon: Trophy,
    title: "กีฬาและนันทนาการ",
    description: "เสริมสร้างร่างกายแข็งแรงและจิตใจที่เข้มแข็ง",
    category: "กีฬา",
    gradient: "bg-gradient-sports"
  }, {
    icon: Microscope,
    title: "วิทยาศาสตร์ประยุกต์",
    description: "ทดลองและค้นคว้าเพื่อความเข้าใจในธรรมชาติ",
    category: "วิทยาศาสตร์",
    gradient: "bg-gradient-science"
  }, {
    icon: Calculator,
    title: "คณิตศาสตร์สนุก",
    description: "เรียนรู้คณิตศาสตร์ผ่านการเล่นและกิจกรรมที่น่าสนใจ",
    category: "คณิตศาสตร์",
    gradient: "bg-gradient-math"
  }, {
    icon: BookOpen,
    title: "ห้องสมุดและการอ่าน",
    description: "ส่งเสริมนิสัยรักการอ่านและการเรียนรู้ด้วยตนเอง",
    category: "ภาษา",
    gradient: "bg-gradient-reading"
  }, {
    icon: Users,
    title: "กิจกรรมสร้างสรรค์สังคม",
    description: "เรียนรู้การทำงานเป็นทีมและการใช้ชีวิตในสังคม",
    category: "สังคม",
    gradient: "bg-gradient-social"
  }, {
    icon: Gamepad2,
    title: "เทคโนโลยีเพื่อการศึกษา",
    description: "ใช้เทคโนโลยีสมัยใหม่เป็นเครื่องมือในการเรียนรู้",
    category: "เทคโนโลยี",
    gradient: "bg-gradient-tech"
  }];
  return <section id="activities" className="py-20 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Users className="w-4 h-4 mr-2" />
            กิจกรรมภายใน
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            กิจกรรมหลากหลาย สร้างสรรค์อนาคต
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ส่งเสริมการเรียนรู้ผ่านกิจกรรมที่หลากหลาย 
            เพื่อพัฒนาทักษะชีวิตและความสามารถในด้านต่าง ๆ อย่างรอบด้าน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {activities.map((activity, index) => {
          const IconComponent = activity.icon;
          return <Card key={index} className="bg-white border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group">
                <CardContent className="p-6 text-center rounded-2xl">
                  <div className={`w-16 h-16 ${activity.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <Badge variant="outline" className="mb-3 text-xs">
                    {activity.category}
                  </Badge>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {activity.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {activity.description}
                  </p>
                </CardContent>
              </Card>;
        })}
        </div>

        {/* Highlight Section */}
        <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            ร่วมเป็นส่วนหนึ่งของกิจกรรมสุดพิเศษ
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            ทุกภาคเรียนมีกิจกรรมพิเศษและการแข่งขันที่จะช่วยพัฒนาศักยภาพของนักเรียน
            ให้สามารถแสดงออกและเรียนรู้ได้อย่างเต็มที่
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="bg-white text-primary hover:bg-white/90">
              ดูกิจกรรมทั้งหมด
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              สมัครเข้าร่วม
            </Button>
          </div>
        </div>
      </div>
    </section>;
};
export default ActivitiesSection;