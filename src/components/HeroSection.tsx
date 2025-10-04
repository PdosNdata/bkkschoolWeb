import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const HeroSection = () => {
  const navigate = useNavigate();
  
  const { data: activities = [] } = useQuery({
    queryKey: ['activities', 'creative-society'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .in('category', ['กิจกรรมภายใน', 'กิจกรรมภายนอก'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
  return <section id="home" className="relative min-h-[90vh] bg-gradient-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
    }}></div>
      
      <div className="container mx-auto px-4 py-20 relative bg-purple-400">
        <div className="text-center mb-12">
          
          
          <h1 className="text-4xl font-bold mb-6 leading-tight text-violet-950 md:text-6xl">
            โรงเรียนบ้านค้อดอนแคน
            <br />
            <span className="text-white/90 text-3xl md:text-4xl">โรงเรียนโครงการด้วยรักและห่วงใย</span>
          </h1>
          
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            พัฒนาการศึกษาด้วยหลักสูตรที่ทันสมัย เพื่อสร้างนักเรียนให้มีความรู้และคุณธรรม
            พร้อมก้าวสู่โลกอนาคต
          </p>

          {/* Activities Layout */}
          <div className="mb-12">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">กิจกรรมสร้างสรรค์สังคม</h3>
              
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
                {activities.map((activity) => {
                  const coverImageUrl = activity.cover_image || (activity.images && activity.images.length > 0 ? activity.images[activity.cover_image_index || 0] : null);
                  
                  return (
                    <div 
                      key={activity.id} 
                      className="bg-white overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer border border-white"
                      onClick={() => navigate(`/activity/${activity.id}`)}
                    >
                      <div className="h-32 bg-gradient-to-t from-blue-300 to-blue-600 flex items-center justify-center overflow-hidden">
                        {coverImageUrl ? (
                          <img src={coverImageUrl} alt={activity.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                        ) : (
                          <span className="text-white font-medium text-center text-sm px-4">{activity.title}</span>
                        )}
                      </div>
                      <div className="p-4 bg-white">
                        <h5 className="font-medium text-sm mb-2 text-blue-600 text-center">{activity.title}</h5>
                        <p className="text-xs mb-3 text-blue-800 line-clamp-2">{activity.content}</p>
                        <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
                          อ่านต่อ →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-t from-blue-300 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">หลักสูตรทันสมัย</h3>
              <p className="text-white/90 text-sm">พัฒนาการเรียนรู้ด้วยการเรียนรู้ที่หลากหลาย ภูมิปัญญาท้องถิ่น</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-t from-green-300 to-green-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => navigate('/public-personnel-report')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">ครูที่มีประสบการณ์</h3>
              <p className="text-white/90 text-sm">ทีมงานที่มีประสบการณ์</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-t from-rose-300 to-rose-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">ผลงานที่โดดเด่น</h3>
              <p className="text-white/90 text-sm">รางวัลระดับจังหวัดและประเทศ</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-t from-orange-300 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">นวัตกรรมการเรียนรู้</h3>
              <p className="text-white/90 text-sm">ส่งเสริมความคิดสร้างสรรค์</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};
export default HeroSection;