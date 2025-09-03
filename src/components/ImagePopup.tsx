import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
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
      <DialogContent className="max-w-[1200px] w-[95vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none">
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-white via-purple-50 to-purple-100">
          {/* Close button */}
          <button onClick={handleClose} className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200 shadow-lg hover:shadow-xl">
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Image content */}
          <div className="relative">
            <img src="https://raw.githubusercontent.com/PdosNdata/myimages/33468a0daecd2f816cebbef0fc80bc5196062b8e/firstpopup.png" alt="โรงเรียนบ้านค้อดอนแคน" className="w-full h-[600px] max-h-[600px] object-cover" />
            
            {/* Overlay content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
              <div className="p-8 text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  ยินดีต้อนรับสู่โรงเรียนบ้านค้อดอนแคน
                </h2>
                <p className="text-lg md:text-xl mb-6 max-w-2xl">สถานศึกษาที่มุ่งเน้นการพัฒนาศักยภาพนักเรียนอย่างรอบด้าน ด้วยการศึกษาที่มีคุณภาพดีเยี่ยม</p>
                <button onClick={handleClose} className="bg-gradient-purple-soft text-purple-900 px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                  เข้าสู่เว็บไซต์
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default ImagePopup;