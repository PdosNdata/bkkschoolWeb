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
      
      <div className="container mx-auto px-4 py-20 relative">
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
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h4 className="text-white font-semibold mb-4">วิดีโอนำเสนอกิจกรรม</h4>
                    <div className="space-y-4">
                      <a 
                        href="https://youtu.be/ZpWMD-MT5gE?si=hwRERNwzD3k837b5" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src="https://img.youtube.com/vi/ZpWMD-MT5gE/hqdefault.jpg" 
                              alt="YouTube Video Thumbnail"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[3px] border-y-transparent ml-0.5"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-white/80 text-sm mb-1">YouTube Video</p>
                            <p className="text-blue-300 group-hover:text-blue-200 text-xs">กิจกรรมโครงการด้วยรักและห่วงใย</p>
                          </div>
                        </div>
                      </a>
                      
                      <a 
                        href="https://youtu.be/j6yxlI3ShdQ?si=xHz7h_CheqWF41BD" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src="https://img.youtube.com/vi/j6yxlI3ShdQ/hqdefault.jpg" 
                              alt="YouTube Video Thumbnail"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[3px] border-y-transparent ml-0.5"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-white/80 text-sm mb-1">YouTube Video</p>
                            <p className="text-blue-300 group-hover:text-blue-200 text-xs">กิจกรรมโครงการด้วยรักและห่วงใย</p>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Side - Activity Images Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl p-6 h-32 flex items-center justify-center">
                    <span className="text-white font-medium text-center text-sm">ภาพกิจกรรมปลูกข้าว</span>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl p-6 h-32 flex items-center justify-center">
                    <span className="text-white font-medium text-center text-sm">ภาพกิจกรรมเลี้ยงปลา</span>
                  </div>
                  <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl p-6 h-32 flex items-center justify-center">
                    <span className="text-white font-medium text-center text-sm">ภาพกิจกรรมปลูกมะนาวหน่อง</span>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl p-6 h-32 flex items-center justify-center">
                    <span className="text-white font-medium text-center text-sm">ภาพกิจกรรมเลี้ยงหญ้า</span>
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