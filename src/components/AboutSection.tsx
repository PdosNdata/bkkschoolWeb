import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Target, Heart, Star, X, Maximize2, Users, UserCheck, Award, Flame } from "lucide-react";
import { useState } from "react";
import schoolHistoryImage from "@/assets/school-history-optimized.webp";
const STATS = [
  { value: "250+", label: "นักเรียน", Icon: Users, gradient: "from-sky-500 via-blue-600 to-indigo-700", glow: "shadow-blue-500/40" },
  { value: "20+", label: "ครูและบุคลากร", Icon: UserCheck, gradient: "from-emerald-500 via-emerald-600 to-teal-700", glow: "shadow-emerald-500/40" },
  { value: "15+", label: "ปีประสบการณ์", Icon: Award, gradient: "from-orange-500 via-orange-600 to-red-600", glow: "shadow-orange-500/40" },
  { value: "100%", label: "ความมุ่งมั่น", Icon: Flame, gradient: "from-fuchsia-500 via-purple-600 to-violet-700", glow: "shadow-purple-500/40" },
];

const AboutSection = () => {
  const [isImageOpen, setIsImageOpen] = useState(false);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center mb-16">
          <div
            className="lg:col-span-2 rounded-xl overflow-hidden shadow-elegant relative group cursor-pointer"
            onClick={() => setIsImageOpen(true)}
          >
            <img
              src={schoolHistoryImage}
              alt="ประวัติโรงเรียนบ้านค้อดอนแคน ตำบลค้อใหญ่ อำเภอกู่แก้ว จังหวัดอุดรธานี"
              className="w-full h-auto object-contain"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-full p-3">
                <Maximize2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
            <DialogContent className="max-w-none w-screen h-screen sm:rounded-none border-0 bg-black/95 flex items-center justify-center p-4">
              <DialogTitle className="sr-only">ประวัติโรงเรียนบ้านค้อดอนแคน</DialogTitle>
              <img
                src={schoolHistoryImage}
                alt="ประวัติโรงเรียนบ้านค้อดอนแคน ตำบลค้อใหญ่ อำเภอกู่แก้ว จังหวัดอุดรธานี"
                className="max-w-full max-h-full object-contain"
              />
              <DialogClose className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors">
                <X className="h-5 w-5" />
              </DialogClose>
            </DialogContent>
          </Dialog>

          <div className="lg:col-span-1 grid grid-cols-2 gap-4">
            {STATS.map(({ value, label, Icon, gradient, glow }) => (
              <div
                key={label}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-center text-white shadow-lg ${glow} ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-1.5 hover:brightness-105`}
              >
                <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125" />
                <span aria-hidden className="pointer-events-none absolute -bottom-10 -left-6 h-20 w-20 rounded-full bg-white/10" />
                <div className="relative">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/25 ring-2 ring-white/50 shadow-inner backdrop-blur-sm">
                    <Icon className="h-5 w-5 text-white drop-shadow" />
                  </div>
                  <div className="text-3xl font-extrabold leading-none tracking-tight drop-shadow-sm">{value}</div>
                  <div className="mt-1.5 text-sm font-semibold text-white/95">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-blue-500/40 relative overflow-hidden border-0 ring-1 ring-white/30 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-white/25 ring-2 ring-white/50 backdrop-blur-sm shadow-inner rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">วิสัยทัศน์</h3>
              <p className="text-white/95">โรงเรียนบ้านค้อดอนแคน เป็นแหล่งเรียนรู้คู่คุณธรรม นำชุมชนพัฒนาการศึกษาตามหลักปรัชญาของเศรษฐกิจพอเพียง นักเรียนมีคุณภาพตามมาตรฐาน ครูเป็นครูมืออาชีพ</p>
            </CardContent>
          </Card>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-700 shadow-rose-500/40 relative overflow-hidden border-0 ring-1 ring-white/30 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-white/25 ring-2 ring-white/50 backdrop-blur-sm shadow-inner rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">พันธกิจ</h3>
                  <p className="text-white/95">จัดการศึกษาตั้งแต่อนุบาลถึงชั้นมัธยมศึกษาปีที่  ๓  ให้ทั่วถึงทุกคนในเขตบริการและได้คุณภาพตามเกณฑ์มาตรฐานการศึกษาขั้นพื้นฐานพร้อมทั้งพัฒนาระบบบริหารแหล่งเรียนรู้  และการจัดประสบการณ์ให้เด็กปฐมวัยอย่างมีคุณภาพ</p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-[600px] max-h-[500px] overflow-y-auto">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">พันธกิจโรงเรียนบ้านค้อดอนแคน</h3>
                <div className="space-y-3 text-sm leading-relaxed">
                  <p><strong>๑.</strong> จัดการศึกษาตั้งแต่อนุบาลถึงชั้นมัธยมศึกษาปีที่ ๓ ให้ทั่วถึงทุกคนในเขตบริการและได้คุณภาพตามเกณฑ์มาตรฐานการศึกษาขั้นพื้นฐานพร้อมทั้งพัฒนาระบบบริหารแหล่งเรียนรู้ และการจัดประสบการณ์ให้เด็กปฐมวัยอย่างมีคุณภาพ</p>
                  <p><strong>๒.</strong> พัฒนากระบวนการเรียนรู้ แหล่งเรียนรู้ สภาพแวดล้อมให้กับนักเรียน และเด็กที่ด้อยโอกาส พิการ ที่เรียนร่วมกับเด็กปกติได้อย่างมีคุณภาพ</p>
                  <p><strong>๓.</strong> ปลูกฝังให้นักเรียนเป็นคนดี มีความสุข และมีคุณธรรมตามหลักค่านิยมพื้นฐาน ๑๒ ประการ</p>
                  <p><strong>๔.</strong> พัฒนาหลักสูตรสถานศึกษาให้มีความสอดคล้องกับมาตรฐานการเรียนรู้และตัวชี้วัดแต่ละกลุ่มสาระการเรียนรู้ โดยเน้นยกระดับผลสัมฤทธิ์ทางการเรียน เน้นพัฒนาการอ่านออกเขียนได้ คิดเลขเป็น คิดสร้างสรรค์และการแก้ปัญหาอย่างสร้างสรรค์</p>
                  <p><strong>๕.</strong> นำหลักปรัชญาเศรษฐกิจพอเพียง และศาสตร์พระราชามาใช้ในการจัดกระบวนการเรียนรู้ทั้งภายในและภายนอกชั้นเรียน</p>
                  <p><strong>๖.</strong> พัฒนาและนำเทคโนโลยีมาใช้ในการจัดกระบวนการเรียนรู้และกระบวนการบริหารให้ทันต่อวิทยาการสมัยใหม่อยู่เสมอ โดยไม่ทิ้งภูมิปัญญาท้องถิ่น</p>
                  <p><strong>๗.</strong> เพิ่มประสิทธิภาพการบริหารจัดการโดยยึดหลักธรรมาภิบาลให้ครู บุคลากรภายในโรงเรียนได้รับการพัฒนาอย่างหลากหลายและต่อเนื่อง</p>
                  <p><strong>๘.</strong> มุ่งสร้างความสัมพันธ์อันดีกับชุมชน รับฟังความคิดเห็นจากทุกฝ่ายนำมาปรับปรุงพัฒนาอยู่เสมอ สนับสนุนให้ความร่วมมือต่อชุมชน และให้ชุมชนมีส่วนร่วมและสนับสนุนโรงเรียนด้วยความเต็มใจ</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/40 relative overflow-hidden border-0 ring-1 ring-white/30 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-white/25 ring-2 ring-white/50 backdrop-blur-sm shadow-inner rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">เป้าประสงค์</h3>
                  <p className="text-white/95">
                    ความซื่อสัตย์ ความรับผิดชอบ 
                    การมีจิตสาธารณะ และการใฝ่เรียนรู้
                  </p>
                </CardContent>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-[500px] max-h-[400px] overflow-y-auto">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">เป้าประสงค์โรงเรียนบ้านค้อดอนแคน</h3>
                <div className="space-y-3 text-sm leading-relaxed">
                  <p>เพื่อให้งานบรรลุผลตามพันธกิจโรงเรียน ได้ยึดเอามาตรฐานการศึกษาระดับปฐมวัย ๓ มาตรฐาน และระดับขั้นพื้นฐาน ๓ มาตรฐาน มาวิเคราะห์เป็นเป้าประสงค์ในการปฏิบัติงานโครงการต่าง ๆ และใช้ตัวชี้วัดของแต่ละมาตรฐานเป็นเป้าหมายระดับโครงการ เพื่อมุ่งพัฒนาโรงเรียนให้ได้คุณภาพตามมาตรฐานการศึกษาขั้นพื้นฐาน ดังนี้</p>
                  <p><strong>๑.</strong> โรงเรียนได้รับการรับรองมาตรฐานจากการประเมินคุณภาพภายนอกของ สมศ.</p>
                  <p><strong>๒.</strong> สถานศึกษามีหลักสูตรที่สอดคล้องกับมาตรฐานการเรียนรู้และตัวชี้วัดแต่ละกลุ่มสาระการเรียนรู้</p>
                  <p><strong>๓.</strong> นักเรียนร้อยละ ๘๐ เป็นคนดี คนเก่งและมีคุณธรรมตามหลักค่านิยมพื้นฐาน ๑๒ ประการ</p>
                  <p><strong>๔.</strong> เด็กพิเศษเรียนร่วมได้รับการพัฒนาอย่างเต็มตามศักยภาพ</p>
                  <p><strong>๕.</strong> ครู นักเรียนสามารถใช้เทคโนโลยีในการพัฒนาการเรียนการสอนได้</p>
                  <p><strong>๖.</strong> สถานศึกษาเป็นศูนย์การเรียนรู้ตามหลักปรัชญาเศรษฐกิจพอเพียงอย่างมีคุณภาพ</p>
                  <p><strong>๗.</strong> สถานศึกษามีการบริหารจัดการตามหลักธรรมาภิบาลอย่างมีประสิทธิภาพ</p>
                  <p><strong>๘.</strong> ชุมชนให้การยอมรับและให้การสนับสนุนด้านการพัฒนาการศึกษา</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </section>;
};
export default AboutSection;