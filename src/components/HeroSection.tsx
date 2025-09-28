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
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                        <iframe src="https://www.youtube.com/embed/j6yxIl3ShdQ" title="วิดีโอนำเสนอกิจกรรมโครงการด้วยรักและห่วงใย" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full rounded-xl" />
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                       <iframe src="https://www.youtube.com/embed/ZpWMD-MT5gE" title="วิดีโอนำเสนอกิจกรรมโครงการด้วยรักและห่วงใย" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full rounded-xl" />
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

                {/* Right Side - Activity Images Grid - 3 columns x 3 rows */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-green-300 to-green-600 relative">
                      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M20,20 L80,20 L80,80 L20,80 Z\" fill=\"%23ffffff\" opacity=\"0.1\"/%3E%3C/svg%3E')" }}></div>
                    </div>
                    <div className="p-4">
                      <Badge className="bg-green-100 text-green-800 text-xs mb-2">การเกษตร</Badge>
                      <h5 className="font-medium text-sm mb-2 text-gray-900">กิจกรรมปลูกข้าวแปลงนาสาธิต</h5>
                      <p className="text-xs text-gray-600 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        บ้านค้อดอนแคน
                      </p>
                    </div>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M20,20 L80,20 L80,80 L20,80 Z\" fill=\"%23ffffff\" opacity=\"0.1\"/%3E%3C/svg%3E')" }}></div>
                    </div>
                    <div className="p-4">
                      <Badge className="bg-blue-100 text-blue-800 text-xs mb-2">การประมง</Badge>
                      <h5 className="font-medium text-sm mb-2 text-gray-900">กิจกรรมเลี้ยงปลาดุกและกบในบ่อซีเมนต์</h5>
                      <p className="text-xs text-gray-600 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        บ้านค้อดอนแคน
                      </p>
                    </div>
                  </div>
                  
                  {/* Card 3 */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-orange-400 to-orange-600 relative">
                      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M20,20 L80,20 L80,80 L20,80 Z\" fill=\"%23ffffff\" opacity=\"0.1\"/%3E%3C/svg%3E')" }}></div>
                    </div>
                    <div className="p-4">
                      <Badge className="bg-orange-100 text-orange-800 text-xs mb-2">สวนผลไม้</Badge>
                      <h5 className="font-medium text-sm mb-2 text-gray-900">กิจกรรมปลูกมะนาววงบ่อ</h5>
                      <p className="text-xs text-gray-600 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        บ้านค้อดอนแคน
                      </p>
                    </div>
                  </div>
                  
                  {/* Card 4 */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-600 relative">
                      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M20,20 L80,20 L80,80 L20,80 Z\" fill=\"%23ffffff\" opacity=\"0.1\"/%3E%3C/svg%3E')" }}></div>
                    </div>
                    <div className="p-4">
                      <Badge className="bg-purple-100 text-purple-800 text-xs mb-2">ปศุสัตว์</Badge>
                      <h5 className="font-medium text-sm mb-2 text-gray-900">กิจกรรมเลี้ยงหมูป่า</h5>
                      <p className="text-xs text-gray-600 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        บ้านค้อดอนแคน
                      </p>
                    </div>
                  </div>
                  
                  {/* Card 5 */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-red-400 to-red-600 relative">
                      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M20,20 L80,20 L80,80 L20,80 Z\" fill=\"%23ffffff\" opacity=\"0.1\"/%3E%3C/svg%3E')" }}></div>
                    </div>
                    <div className="p-4">
                      <Badge className="bg-red-100 text-red-800 text-xs mb-2">สวนผัก</Badge>
                      <h5 className="font-medium text-sm mb-2 text-gray-900">กิจกรรมปลูกผักตามฤดูกาลและพืชผักสวนครัว</h5>
                      <p className="text-xs text-gray-600 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        บ้านค้อดอนแคน
                      </p>
                    </div>
                  </div>
                  
                  {/* Card 6 */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-pink-400 to-pink-600 relative">
                      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M20,20 L80,20 L80,80 L20,80 Z\" fill=\"%23ffffff\" opacity=\"0.1\"/%3E%3C/svg%3E')" }}></div>
                    </div>
                    <div className="p-4">
                      <Badge className="bg-pink-100 text-pink-800 text-xs mb-2">สวนผลไม้</Badge>
                      <h5 className="font-medium text-sm mb-2 text-gray-900">กิจกรรมปลูกไม้ผล</h5>
                      <p className="text-xs text-gray-600 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        บ้านค้อดอนแคน
                      </p>
                    </div>
                  </div>
                  
                  {/* Card 7 */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-teal-400 to-teal-600 relative">
                      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M20,20 L80,20 L80,80 L20,80 Z\" fill=\"%23ffffff\" opacity=\"0.1\"/%3E%3C/svg%3E')" }}></div>
                    </div>
                    <div className="p-4">
                      <Badge className="bg-teal-100 text-teal-800 text-xs mb-2">ปศุสัตว์</Badge>
                      <h5 className="font-medium text-sm mb-2 text-gray-900">กิจกรรมเลี้ยงไก่ไข่ เป็ด ไก่พันธุ์พื้นเมือง</h5>
                      <p className="text-xs text-gray-600 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        บ้านค้อดอนแคน
                      </p>
                    </div>
                  </div>
                  
                  {/* Card 8 */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-indigo-400 to-indigo-600 relative">
                      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M20,20 L80,20 L80,80 L20,80 Z\" fill=\"%23ffffff\" opacity=\"0.1\"/%3E%3C/svg%3E')" }}></div>
                    </div>
                    <div className="p-4">
                      <Badge className="bg-indigo-100 text-indigo-800 text-xs mb-2">อนุรักษ์</Badge>
                      <h5 className="font-medium text-sm mb-2 text-gray-900">กิจกรรมอนุรักษ์ป่าไผ่</h5>
                      <p className="text-xs text-gray-600 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        บ้านค้อดอนแคน
                      </p>
                    </div>
                  </div>
                  </div>
                  
                  {/* Card 9 */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 relative">
                      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M20,20 L80,20 L80,80 L20,80 Z\" fill=\"%23ffffff\" opacity=\"0.1\"/%3E%3C/svg%3E')" }}></div>
                    </div>
                    <div className="p-4">
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs mb-2">การเรียนรู้</Badge>
                      <h5 className="font-medium text-sm mb-2 text-gray-900">กิจกรรมเรียนรู้ภูมิปัญญาท้องถิ่น</h5>
                      <p className="text-xs text-gray-600 mb-2 flex items-center">
                        <span className="mr-1">📍</span>
                        บ้านค้อดอนแคน
                      </p>
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