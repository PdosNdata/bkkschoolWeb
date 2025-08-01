import Header from "@/components/Header";
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
      <HeroSection />
      <div className="bg-muted/30">
        <AboutSection />
      </div>
      <ActivitiesSection />
      <div className="bg-muted/30">
        <NewsSection />
      </div>
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
