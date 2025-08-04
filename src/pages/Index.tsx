import Header from "@/components/Header";
import ImageSlider from "@/components/ImageSlider";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ActivitiesSection from "@/components/ActivitiesSection";
import NewsSection from "@/components/NewsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
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
      <Footer />
    </div>
  );
};

export default Index;
