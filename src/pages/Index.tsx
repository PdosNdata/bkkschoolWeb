import Header from "@/components/Header";
import ImageSlider from "@/components/ImageSlider";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ActivitiesSection from "@/components/ActivitiesSection";
import NewsSection from "@/components/NewsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ImagePopup from "@/components/ImagePopup";

const Index = () => {
  return (
    <div className="min-h-screen">
      <ImagePopup />
      <Header />
      <ImageSlider />
      <HeroSection />
      <div className="bg-muted/30">
        <AboutSection />
      </div>
      <div className="bg-pink-50/70">
        <ActivitiesSection />
      </div>
      <div className="bg-muted/30">
        <NewsSection />
      </div>
      <div className="bg-pink-50/70">
        <ContactSection />
      </div>
      <div className="bg-muted/30">
        <section id="contact" className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ติดต่อเรา
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              สามารถติดต่อสอบถามข้อมูลเพิ่มเติมได้ที่
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2">โทรศัพท์</h3>
                <p className="text-muted-foreground">043-123-4567</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2">อีเมล</h3>
                <p className="text-muted-foreground">41030208@udonthani3.ac.th</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2">ที่อยู่</h3>
                <p className="text-muted-foreground">93 หมู่ที่ 3 ตำบลค้อใหญ่ อำเภอกู่แก้ว จังหวัดอุดรธานี</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
