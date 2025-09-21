import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Target, Heart, Star } from "lucide-react";
const AboutSection = () => {
  return <section id="history" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <GraduationCap className="w-4 h-4 mr-2" />
            ประวัติโรงเรียน
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            โรงเรียนบ้านค้อดอนแคน
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ก่อตั้งขึ้นเพื่อเป็นแหล่งเรียนรู้และพัฒนาการศึกษาในท้องถิ่น 
            มุ่งเน้นการปลูกฝังคุณธรรม จริยธรรม และความรู้ที่ทันสมัย
          </p>
        </div>

        {/* Video Section */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">วิดีโอนำเสนอโรงเรียน</h3>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-elegant">
              <iframe
                src="https://www.youtube.com/embed/ZpWMD-MT5gE"
                title="วิดีโอนำเสนอโรงเรียนบ้านค้อดอนแคน"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">เรื่องราวของเรา</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              โรงเรียนบ้านค้อดอนแคนเป็นโรงเรียนที่มีประวัติความเป็นมายาวนาน 
              ตั้งอยู่ในชุมชนที่อบอุ่น มีการพัฒนาการศึกษาอย่างต่อเนื่อง 
              เพื่อให้นักเรียนได้รับการศึกษาที่มีคุณภาพ
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              ด้วยทีมครูที่มีประสบการณ์และความมุ่งมั่น 
              พร้อมสร้างสรรค์การเรียนรู้ที่หลากหลายและสนุกสนาน 
              เพื่อเตรียมนักเรียนสู่การเป็นพลเมืองที่ดีของสังคม
            </p>
          </div>
          
          <div className="bg-gradient-card rounded-xl p-8 shadow-elegant">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">250+</div>
                <div className="text-muted-foreground">นักเรียน</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">25+</div>
                <div className="text-muted-foreground">ครูและบุคลากร</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">15+</div>
                <div className="text-muted-foreground">ปีประสบการณ์</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">ความมุ่งมั่น</div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gradient-vision border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">วิสัยทัศน์</h3>
              <p className="text-white/90">โรงเรียนบ้านค้อดอนแคน เป็นแหล่งเรียนรู้คู่คุณธรรม นำชุมชนพัฒนาการศึกษาตามหลักปรัชญาของเศรษฐกิจพอเพียง นักเรียนมีคุณภาพตามมาตรฐาน ครูเป็นครูมืออาชีพ</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-mission border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">พันธกิจ</h3>
              <p className="text-white/90">จัดการศึกษาตั้งแต่อนุบาลถึงชั้นมัธยมศึกษาปีที่  ๓  ให้ทั่วถึงทุกคนในเขตบริการและได้คุณภาพตามเกณฑ์มาตรฐานการศึกษาขั้นพื้นฐานพร้อมทั้งพัฒนาระบบบริหารแหล่งเรียนรู้  และการจัดประสบการณ์ให้เด็กปฐมวัยอย่างมีคุณภาพ</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-values border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">ค่านิยม</h3>
              <p className="text-stone-950">
                ความซื่อสัตย์ ความรับผิดชอบ 
                การมีจิตสาธารณะ และการใฝ่เรียนรู้
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};
export default AboutSection;