import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, Lightbulb, Download, ArrowRight, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
interface FeatureCard {
  title: string;
  description: string;
  Icon: LucideIcon;
  gradient: string;
  glow: string;
  href?: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    title: "หลักสูตรทันสมัย",
    description: "พัฒนาการเรียนรู้ด้วยการเรียนรู้ที่หลากหลาย ภูมิปัญญาท้องถิ่น",
    Icon: BookOpen,
    gradient: "from-blue-500 via-blue-600 to-indigo-700",
    glow: "shadow-blue-500/40",
  },
  {
    title: "ครูที่มีประสบการณ์",
    description: "ทีมงานที่มีประสบการณ์",
    Icon: Users,
    gradient: "from-emerald-500 via-emerald-600 to-teal-700",
    glow: "shadow-emerald-500/40",
    href: "/public-personnel-report",
  },
  {
    title: "ผลงานที่โดดเด่น",
    description: "รางวัลระดับจังหวัดและประเทศ",
    Icon: Award,
    gradient: "from-rose-500 via-rose-600 to-pink-700",
    glow: "shadow-rose-500/40",
  },
  {
    title: "นวัตกรรมการเรียนรู้",
    description: "แผนการสอน · นวัตกรรม · หลักสูตรโรงเรียน",
    Icon: Lightbulb,
    gradient: "from-orange-500 via-orange-600 to-red-600",
    glow: "shadow-orange-500/40",
    href: "/documents",
  },
  {
    title: "ดาวน์โหลดเอกสาร",
    description: "แบบฟอร์มและเอกสารของโรงเรียน",
    Icon: Download,
    gradient: "from-violet-500 via-purple-600 to-fuchsia-700",
    glow: "shadow-violet-500/40",
    href: "/document-downloads",
  },
];

const HeroSection = () => {
  const navigate = useNavigate();
  
  const { data: activities = [] } = useQuery({
    queryKey: ['activities', 'กิจกรรมด้วยรักและห่วงใย'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('category', 'กิจกรรมด้วยรักและห่วงใย')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
  
  return <section id="home" className="relative min-h-[90vh] bg-gradient-to-b from-pink-100 via-pink-50 to-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
    }}></div>
      
      <div className="container mx-auto px-4 py-20 relative">
        <div className="text-center mb-12">


          <h1 className="text-4xl font-bold mb-6 leading-tight text-violet-950 md:text-6xl">
            โรงเรียนบ้านค้อดอนแคน
            <br />
            <span className="text-rose-500 text-3xl md:text-4xl">โรงเรียนโครงการด้วยรักและห่วงใย</span>
          </h1>

          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            พัฒนาการศึกษาด้วยหลักสูตรที่ทันสมัย เพื่อสร้างนักเรียนให้มีความรู้และคุณธรรม
            พร้อมก้าวสู่โลกอนาคต
          </p>

          {/* Activities Layout */}
          <div className="mb-12">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold text-violet-950 mb-8 text-center">กิจกรรมโครงการด้วยรักและห่วงใย</h3>
              
              {/* Videos Row - แถวบน */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                  <iframe src="https://www.youtube.com/embed/j6yxIl3ShdQ" title="วิดีโอนำเสนอกิจกรรมโครงการด้วยรักและห่วงใย" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
                </div>
                
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                  <iframe src="https://www.youtube.com/embed/ZpWMD-MT5gE" title="วิดีโอนำเสนอกิจกรรมโครงการด้วยรักและห่วงใย" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
                </div>
              </div>

              {/* Activity Cards - 4 คอลัมน์ 2 แถว */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105" onClick={() => navigate(`/activities/${activity.id}`)}>
                      <div className="h-32 flex items-center justify-center overflow-hidden relative">
                        {activity.images && activity.images.length > 0 ? (
                          <img 
                            src={activity.images[activity.cover_image_index || 0]} 
                            alt={activity.title} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-t from-blue-300 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-medium text-center text-sm px-4">{activity.title}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-white">
                        <h5 className="font-medium text-sm mb-2 text-blue-600 text-center">{activity.title}</h5>
                        <p className="text-xs mb-3 text-blue-800 line-clamp-2">{activity.content.substring(0, 80)}...</p>
                        <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
                          อ่านต่อ →
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">ยังไม่มีกิจกรรมในหมวดนี้</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {FEATURE_CARDS.map(({ title, description, Icon, gradient, glow, href }) => {
            const clickable = !!href;
            return (
              <div
                key={title}
                role={clickable ? "link" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable ? () => navigate(href) : undefined}
                onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(href); } } : undefined}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-center text-white shadow-lg ${glow} ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 ${clickable ? "cursor-pointer" : ""}`}
              >
                {/* soft decorative bubbles */}
                <span aria-hidden className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125" />
                <span aria-hidden className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent" />

                <div className="relative">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 shadow-inner ring-2 ring-white/50 backdrop-blur-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon className="h-7 w-7 text-white drop-shadow" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold leading-snug drop-shadow-sm">{title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-white/95">{description}</p>
                  {clickable && (
                    <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold backdrop-blur-sm transition-colors group-hover:bg-white/40">
                      เข้าดู <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>;
};
export default HeroSection;