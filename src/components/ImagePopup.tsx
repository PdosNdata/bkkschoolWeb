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

        {/* Soft purple, layered frame */}
        <div className="relative rounded-3xl p-2.5 sm:p-4
                        bg-gradient-to-br from-violet-100 via-white to-purple-100
                        ring-1 ring-white/70 border border-purple-200/60
                        shadow-[0_30px_80px_-24px_rgba(109,40,217,0.55),0_12px_28px_-14px_rgba(109,40,217,0.4)]">
          {/* Inner sheen for a rounded, 3D feel */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl
                          bg-gradient-to-t from-purple-200/40 via-transparent to-white/60" />
          {/* Diffuse glow behind the card */}
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem]
                          bg-purple-400/25 blur-2xl" />

          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="ปิดป๊อปอัพ"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 grid place-items-center
                       h-9 w-9 rounded-full bg-white text-purple-700
                       ring-1 ring-purple-200
                       shadow-[0_8px_20px_-6px_rgba(109,40,217,0.55)]
                       hover:bg-purple-50 hover:scale-105 active:scale-95
                       transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image sits on its own raised card so it reads as a separate layer */}
          <div className="relative overflow-hidden rounded-2xl bg-white
                          ring-1 ring-white/80
                          shadow-[0_18px_44px_-16px_rgba(88,28,135,0.5)]">
            <img
              src={popupImage}
              alt="ข่าวประชาสัมพันธ์โรงเรียนบ้านค้อดอนแคน"
              className="block w-full h-auto max-h-[62vh] object-contain"
              sizes="(max-width: 640px) 95vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, (max-width: 1280px) 70vw, 60vw"
              style={{ maxWidth: '900px', height: 'auto' }}
              loading="eager"
            />
          </div>

          {/* CTA — pressable, 3D purple button */}
          <div className="relative flex justify-center pt-3 sm:pt-4 pb-1">
            <button
              onClick={handleClose}
              className="rounded-xl px-8 py-2.5 sm:px-10 sm:py-3 text-sm sm:text-base font-semibold
                         text-white bg-gradient-to-b from-purple-500 to-purple-700
                         ring-1 ring-purple-400/50
                         shadow-[0_12px_26px_-8px_rgba(126,34,206,0.65),inset_0_1px_0_rgba(255,255,255,0.4)]
                         hover:from-purple-500 hover:to-purple-800 hover:-translate-y-0.5
                         active:translate-y-0 active:shadow-[0_4px_12px_-4px_rgba(126,34,206,0.6)]
                         transition-all duration-200"
            >
              เข้าสู่เว็บไซต์
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default ImagePopup;
