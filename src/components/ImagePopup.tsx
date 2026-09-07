import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import popupImage from "@/assets/popup-image-optimized.webp";
const ImagePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    // Show popup after a short delay when component mounts
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  const handleClose = () => {
    setIsOpen(false);
  };
  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-[900px] h-auto max-h-[90vh] p-0 border-none bg-transparent shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">ประชาสัมพันธ์โรงเรียนบ้านค้อดอนแคน</DialogTitle>
        <DialogDescription className="sr-only">
          ข่าวประชาสัมพันธ์ของโรงเรียนบ้านค้อดอนแคน กดปุ่ม "เข้าสู่เว็บไซต์" หรือปุ่มปิดเพื่อดำเนินการต่อ
        </DialogDescription>
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-white via-purple-50 to-purple-100">
          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="ปิดป๊อปอัพ"
            className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Image content */}
          <img
            src={popupImage}
            alt="ข่าวประชาสัมพันธ์โรงเรียนบ้านค้อดอนแคน"
            className="w-full h-auto max-h-[70vh] object-contain"
            sizes="(max-width: 640px) 95vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, (max-width: 1280px) 70vw, 60vw"
            style={{ maxWidth: '900px', height: 'auto' }}
            loading="eager"
          />

          {/* Action bar below the image so nothing is covered */}
          <div className="flex justify-center px-4 py-3 sm:py-4">
            <button
              onClick={handleClose}
              className="bg-gradient-purple-soft text-purple-900 px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              เข้าสู่เว็บไซต์
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default ImagePopup;