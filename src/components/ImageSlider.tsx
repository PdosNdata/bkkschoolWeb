import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=600&fit=crop",
      title: "กิจกรรมนักเรียน",
      description: "ส่งเสริมความสามารถรอบด้านของนักเรียน",
      link: "#activities"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop",
      title: "สิ่งแวดล้อมการเรียนรู้",
      description: "บรรยากาศที่เอื้อต่อการพัฒนาศักยภาพ",
      link: "#environment"
    },
    {
      id: 3,
      image: "https://raw.githubusercontent.com/PdosNdata/myimages/a0c0d76537450f70ae4e54b518b51b576d2f9f90/piclibrary.jpg",
      title: "ห้องสมุดและแหล่งเรียนรู้",
      description: "แหล่งความรู้ที่ครบครันและทันสมัย",
      link: "#library"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // เปลี่ยนภาพทุก 4 วินาที

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="bg-gradient-purple-soft py-12">
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto">
          <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-white/20 shadow-elegant">
            <div className="relative h-80 md:h-96">
              {/* Main Image */}
              <div className="relative w-full h-full overflow-hidden">
                {slides.map((slide, index) => (
                  <a
                    key={slide.id}
                    href={slide.link}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer group ${
                      index === currentSlide 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-105'
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary-light transition-colors">
                          {slide.title}
                        </h3>
                        <p className="text-white/90 text-sm md:text-base">
                          {slide.description}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Navigation Arrows */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/20"
                onClick={goToPrev}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/20"
                onClick={goToNext}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 py-4 bg-white/50">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-primary scale-110'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;