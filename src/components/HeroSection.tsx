import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, Lightbulb } from "lucide-react";
const HeroSection = () => {
  return <section id="home" className="relative min-h-[90vh] bg-gradient-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
    }}></div>
      
      <div className="container mx-auto px-4 py-20 relative bg-[#9957e1]">
        <div className="text-center mb-12">
          
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
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
              <h3 className="text-2xl font-bold text-white mb-8 text-center">กิจกรรมโครงการด้วยรักและห่วงใย</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Videos */}
                <div className="space-y-6">
                  <div className="backdrop-blur-md rounded-xl p-6 border border-white/20 bg-fuchsia-200">
                    <h4 className="font-semibold mb-4 text-blue-800">วิดีโอนำเสนอกิจกรรม</h4>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="relative w-[500px] h-[360px] rounded-xl overflow-hidden">
                        <iframe src="https://youtu.be/j6yxI135hdQ?si=F1uSMZ9nhy0-5CEA" title="วิดีโอนำเสนอกิจกรรมโครงการด้วยรักและห่วงใย" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full rounded-xl" />
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="relative w-[500px] h-[360px] rounded-xl overflow-hidden">
                       <iframe src="https://youtu.be/j6yxI135hdQ?si=F1uSMZ9nhy0-5CEA" title="วิดีโอนำเสนอกิจกรรมโครงการด้วยรักและห่วงใย" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full rounded-xl" />
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

                {/* Right Side - Activity Images Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-green-300 to-green-600 flex items-center justify-center bg-slate-50 rounded-none">
                      <span className="text-white font-medium text-center text-sm">ภาพกิจกรรมปลูกข้าวในแปลงนาสาธิต</span>
                    </div>
                    <div className="p-3 bg-white">
                      <h5 className="font-medium text-sm mb-1 text-blue-600 text-center">กิจกรรมปลูกข้าวแปลงนาสาธิต</h5>
                      <p className="text-xs mb-2 text-indigo-600">นักเรียนเรียนรู้การปลูกข้าวตามแบบดั้งเดิม</p>
                      <button className="text-xs transition-colors text-slate-800">
                        อ่านต่อ →
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center bg-blue-500">
                      <span className="font-medium text-center text-sm  text-slate-50">ภาพกิจกรรมเลี้ยงปลาดุกในบ่อซีเมนต์</span>
                    </div>
                    <div className="p-3 bg-white">
                      <h5 className="font-medium text-sm mb-1 text-blue-800">กิจกรรมเลี้ยงปลาในบ่อซีเมนต์</h5>
                      <p className="text-xs mb-2 text-blue-800">เรียนรู้การเลี้ยงปลาในบ่อและการดูแล</p>
                      <button className="text-xs transition-colors text-slate-800">
                        อ่านต่อ →
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <span className="text-white font-medium text-center text-sm bg-amber-600">ภาพกิจกรรมปลูกมะนาววงบ่อ</span>
                    </div>
                    <div className="p-3 bg-white">
                      <h5 className="mb-1 font-medium text-sm text-blue-800">กิจกรรมปลูกมะนาววงบ่อ</h5>
                      <p className="text-xs mb-2 text-indigo-600">ปลูกและดูแลมะนาวหน่องตามภูมิปัญญาท้องถิ่น</p>
                      <button className="text-xs transition-colors text-gray-700">
                        อ่านต่อ →
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-medium text-center text-sm">ภาพกิจกรรมเลี้ยงหมู่ป่า</span>
                    </div>
                    <div className="p-3 bg-white">
                      <h5 className="font-medium text-sm mb-1 text-blue-800">กิจกรรมเลี้ยงหมูป่า</h5>
                      <p className="text-xs mb-2 text-indigo-600">เรียนรู้การปลูกและดูแลหญ้าสำหรับอาหารสัตว์</p>
                      <button className="text-xs transition-colors text-gray-800">
                        อ่านต่อ →
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                      <span className="text-white font-medium text-center text-sm">ภาพกิจกรรมปลูกผักในโรงเรือน</span>
                    </div>
                    <div className="p-3 bg-white">
                      <h5 className="font-medium text-sm mb-1 text-blue-800">กิจกรรมปลูกผักในโรงเรือน</h5>
                      <p className="text-xs mb-2 text-indigo-600">เรียนรู้การปลูกผักปลอดสารพิษในโรงเรือน</p>
                      <button className="text-xs transition-colors text-gray-800">
                        อ่านต่อ →
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                      <span className="text-white font-medium text-center text-sm">ภาพกิจกรรมทำปุ่ยชีวภาพ</span>
                    </div>
                    <div className="p-3 bg-white">
                      <h5 className="font-medium text-sm mb-1 text-blue-800">กิจกรรมทำปุ่ยชีวภาพ</h5>
                      <p className="text-xs mb-2 text-indigo-600">เรียนรู้การทำปุ่ยชีวภาพจากวัสดุเหลือใช้</p>
                      <button className="text-xs transition-colors text-gray-800">
                        อ่านต่อ →
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                      <span className="text-white font-medium text-center text-sm">ภาพกิจกรรมเลี้ยงไก่พื้นเมือง</span>
                    </div>
                    <div className="p-3 bg-white">
                      <h5 className="font-medium text-sm mb-1 text-blue-800">กิจกรรมเลี้ยงไก่พื้นเมือง</h5>
                      <p className="text-xs mb-2 text-indigo-600">เรียนรู้การเลี้ยงไก่พื้นเมืองแบบธรรมชาติ</p>
                      <button className="text-xs transition-colors text-gray-800">
                        อ่านต่อ →
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-medium text-center text-sm">ภาพกิจกรรมอนุรักษ์ป่าไผ่</span>
                    </div>
                    <div className="p-3 bg-white">
                      <h5 className="font-medium text-sm mb-1 text-blue-800">กิจกรรมอนุรักษ์ป่าไผ่</h5>
                      <p className="text-xs mb-2 text-indigo-600">เรียนรู้การปลูกและดูแลป่าไผ่เพื่ออนุรักษ์</p>
                      <button className="text-xs transition-colors text-gray-800">
                        อ่านต่อ →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/15 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">หลักสูตรทันสมัย</h3>
              <p className="text-white/80 text-sm">พัฒนาการเรียนรู้ด้วยการเรียนรู้ที่หลากหลาย ภูมิปัญญาท้องถิ่น</p>
            </CardContent>
          </Card>

          <Card className="bg-white/15 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">ครูที่มีประสบการณ์</h3>
              <p className="text-white/80 text-sm">ทีมงานที่มีประสบการณ์</p>
            </CardContent>
          </Card>

          <Card className="bg-white/15 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">ผลงานที่โดดเด่น</h3>
              <p className="text-white/80 text-sm">รางวัลระดับจังหวัดและประเทศ</p>
            </CardContent>
          </Card>

          <Card className="bg-white/15 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">นวัตกรรมการเรียนรู้</h3>
              <p className="text-white/80 text-sm">ส่งเสริมความคิดสร้างสรรค์</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};
export default HeroSection;