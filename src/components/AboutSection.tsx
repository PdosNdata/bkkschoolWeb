import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, Target, Heart, Star, X } from "lucide-react";
import { useState } from "react";
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
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

          <Dialog>
            <DialogTrigger asChild>
              <Card className="bg-gradient-mission border-0 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">พันธกิจ</h3>
                  <p className="text-white/90">จัดการศึกษาตั้งแต่อนุบาลถึงชั้นมัธยมศึกษาปีที่  ๓  ให้ทั่วถึงทุกคนในเขตบริการและได้คุณภาพตามเกณฑ์มาตรฐานการศึกษาขั้นพื้นฐานพร้อมทั้งพัฒนาระบบบริหารแหล่งเรียนรู้  และการจัดประสบการณ์ให้เด็กปฐมวัยอย่างมีคุณภาพ</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">พันธกิจโรงเรียนบ้านค้อดอนแคน</DialogTitle>
                <DialogClose asChild>
                  <Button variant="ghost" size="sm" className="absolute right-4 top-4 h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </DialogHeader>
              <div className="space-y-4 text-sm leading-relaxed mt-4">
                <p><strong>๑.</strong> จัดการศึกษาตั้งแต่อนุบาลถึงชั้นมัธยมศึกษาปีที่ ๓ ให้ทั่วถึงทุกคนในเขตบริการและได้คุณภาพตามเกณฑ์มาตรฐานการศึกษาขั้นพื้นฐานพร้อมทั้งพัฒนาระบบบริหารแหล่งเรียนรู้ และการจัดประสบการณ์ให้เด็กปฐมวัยอย่างมีคุณภาพ</p>
                <p><strong>๒.</strong> พัฒนากระบวนการเรียนรู้ แหล่งเรียนรู้ สภาพแวดล้อมให้กับนักเรียน และเด็กที่ด้อยโอกาส พิการ ที่เรียนร่วมกับเด็กปกติได้อย่างมีคุณภาพ</p>
                <p><strong>๓.</strong> ปลูกฝังให้นักเรียนเป็นคนดี มีความสุข และมีคุณธรรมตามหลักค่านิยมพื้นฐาน ๑๒ ประการ</p>
                <p><strong>๔.</strong> พัฒนาหลักสูตรสถานศึกษาให้มีความสอดคล้องกับมาตรฐานการเรียนรู้และตัวชี้วัดแต่ละกลุ่มสาระการเรียนรู้ โดยเน้นยกระดับผลสัมฤทธิ์ทางการเรียน เน้นพัฒนาการอ่านออกเขียนได้ คิดเลขเป็น คิดสร้างสรรค์และการแก้ปัญหาอย่างสร้างสรรค์</p>
                <p><strong>๕.</strong> นำหลักปรัชญาเศรษฐกิจพอเพียง และศาสตร์พระราชามาใช้ในการจัดกระบวนการเรียนรู้ทั้งภายในและภายนอกชั้นเรียน</p>
                <p><strong>๖.</strong> พัฒนาและนำเทคโนโลยีมาใช้ในการจัดกระบวนการเรียนรู้และกระบวนการบริหารให้ทันต่อวิทยาการสมัยใหม่อยู่เสมอ โดยไม่ทิ้งภูมิปัญญาท้องถิ่น</p>
                <p><strong>๗.</strong> เพิ่มประสิทธิภาพการบริหารจัดการโดยยึดหลักธรรมาภิบาลให้ครู บุคลากรภายในโรงเรียนได้รับการพัฒนาอย่างหลากหลายและต่อเนื่อง</p>
                <p><strong>๘.</strong> มุ่งสร้างความสัมพันธ์อันดีกับชุมชน รับฟังความคิดเห็นจากทุกฝ่ายนำมาปรับปรุงพัฒนาอยู่เสมอ สนับสนุนให้ความร่วมมือต่อชุมชน และให้ชุมชนมีส่วนร่วมและสนับสนุนโรงเรียนด้วยความเต็มใจ</p>
              </div>
            </DialogContent>
          </Dialog>

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