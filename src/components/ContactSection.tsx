import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  Facebook,
  MessageCircle
} from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <MessageCircle className="w-4 h-4 mr-2" />
            ติดต่อเรา
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ติดต่อสอบถามข้อมูล
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            ยินดีให้คำปรึกษาและตอบข้อสงสัยเกี่ยวกับการศึกษา
            และการสมัครเรียนที่โรงเรียนบ้านค้อดอนแคน
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-6">ข้อมูลการติดต่อ</h3>
            
            <Card className="bg-white border-0 shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">ที่อยู่</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      โรงเรียนบ้านค้อดอนแคน<br />
                      93 หมู่ที่ 3 ตำบลค้อใหญ่<br />
                      อำเภอกู่แก้ว จังหวัดอุดรธานี 41130
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">โทรศัพท์</h4>
                    <p className="text-muted-foreground">043-123-4567</p>
                    <p className="text-muted-foreground">081-234-5678 (มือถือ)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">อีเมล</h4>
                    <p className="text-muted-foreground">41030208@udonthani3.ac.th</p>
                    <p className="text-muted-foreground">chaiyapat@udonthani3.ac.th</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">เวลาทำการ</h4>
                    <p className="text-muted-foreground">จันทร์ - ศุกร์: 08.00 - 16.30 น.</p>
                    <p className="text-muted-foreground">เสาร์ - อาทิตย์: ปิดทำการ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <div className="flex space-x-4">
              <Button variant="outline" size="lg" className="flex-1">
                <Facebook className="w-5 h-5 mr-2" />
                Facebook
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <MessageCircle className="w-5 h-5 mr-2" />
                Line
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6">ส่งข้อความถึงเรา</h3>
            
            <Card className="bg-white border-0 shadow-elegant">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        ชื่อ
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="ชื่อของคุณ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        นามสกุล
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="นามสกุลของคุณ"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      อีเมล
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="อีเมลของคุณ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="เบอร์โทรศัพท์ของคุณ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      หัวข้อ
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="หัวข้อที่ต้องการสอบถาม"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      ข้อความ
                    </label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="รายละเอียดที่ต้องการสอบถาม..."
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    ส่งข้อความ
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <Card className="bg-white border-0 shadow-elegant overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-primary p-6 text-white text-center">
                <h3 className="text-xl font-bold mb-2">แผนที่โรงเรียน</h3>
                <p>ตำแหน่งโรงเรียนบ้านค้อดอนแคน</p>
              </div>
              <div className="h-64 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>แผนที่จะแสดงที่นี่</p>
                  <p className="text-sm">เชื่อมต่อกับ Google Maps หรือ OpenStreetMap</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;