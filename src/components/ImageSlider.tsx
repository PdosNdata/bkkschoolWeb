import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import activitiesImage from "@/assets/activities-image-optimized.webp";
import environmentImage from "@/assets/environment-image-optimized.webp";
import libraryImage from "@/assets/library-image-optimized.webp";
import { homeSlidesTable, HomeSlide } from "@/lib/homeSlides";

interface Slide {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
}

// Shown until an admin adds their own slides in the dashboard.
const DEFAULT_SLIDES: Slide[] = [
  {
    id: "default-1",
    image: activitiesImage,
    title: "กิจกรรมนักเรียน",
    description: "ส่งเสริมความสามารถรอบด้านของนักเรียน",
    link: "#activities",
  },
  {
    id: "default-2",
    image: environmentImage,
    title: "สิ่งแวดล้อมการเรียนรู้",
    description: "บรรยากาศที่เอื้อต่อการพัฒนาศักยภาพ",
    link: "#environment",
  },
  {
    id: "default-3",
    image: libraryImage,
    title: "ห้องสมุดและแหล่งเรียนรู้",
    description: "แหล่งความรู้ที่ครบครันและทันสมัย",
    link: "#library",
  },
];

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await homeSlidesTable()
          .select("*")
          .order("display_order", { ascending: true });
        if (error) throw error;

        const rows = (data as HomeSlide[]) || [];
        if (rows.length > 0) {
          setSlides(
            rows.map((row) => ({
              id: row.id,
              image: row.image_url,
              title: row.title,
              description: row.description || "",
              link: row.link || "",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching home slides, using defaults:", error);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    setCurrentSlide(0);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // เปลี่ยนภาพทุก 4 วินาที

    return () => clearInterval(timer);
  }, [slides.length]);

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
            <div className="relative aspect-video">
              {/* Main Image */}
              <div className="relative w-full h-full overflow-hidden bg-slate-100">
                {slides.map((slide, index) => {
                  const content = (
                    <>
                      {/* Blurred fill so any letterbox area isn't empty */}
                      <img
                        src={slide.image}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60"
                      />
                      {/* Full image, never cropped */}
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="relative w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-105"
                        loading={index === 0 ? "eager" : "lazy"}
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                          <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary-light transition-colors">
                            {slide.title}
                          </h3>
                          {slide.description && (
                            <p className="text-white/90 text-sm md:text-base">
                              {slide.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  );

                  const className = `absolute inset-0 transition-all duration-700 ease-in-out group ${
                    slide.link ? "cursor-pointer" : ""
                  } ${index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"}`;

                  return slide.link ? (
                    <a key={slide.id} href={slide.link} className={className}>
                      {content}
                    </a>
                  ) : (
                    <div key={slide.id} className={className}>
                      {content}
                    </div>
                  );
                })}
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
