import { Fragment, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImagePopup from "@/components/ImagePopup";
import { HOME_SECTIONS } from "@/components/home/homeSections";
import { useHomeLayout } from "@/lib/homeLayout";

const sectionByKey = new Map(HOME_SECTIONS.map((s) => [s.key, s]));

const Index = () => {
  // Admins choose the order / visibility of these sections in the dashboard
  const layout = useHomeLayout();

  // ลิงก์ตรงมาที่ส่วนต่าง ๆ เช่น /#activities /#news /#media /#agri-lunch (ใช้ใน LINE OA)
  // เนื้อหาโหลดทีหลัง ตำแหน่งจึงเลื่อน — เลื่อนซ้ำอีกครั้งหลังรูป/ข้อมูลโหลด เว้นแต่ผู้ใช้เลื่อนเองแล้ว
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || /access_token|refresh_token|type=/.test(id)) return;
    let stop = false;
    const cancel = () => { stop = true; };
    window.addEventListener("wheel", cancel, { once: true, passive: true });
    window.addEventListener("touchstart", cancel, { once: true, passive: true });
    const timers = [300, 1000, 2000, 3500].map((ms) => setTimeout(() => {
      if (!stop) document.getElementById(id)?.scrollIntoView({ behavior: ms === 300 ? "auto" : "smooth", block: "start" });
    }, ms));
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
    };
  }, []);
  return <div className="min-h-screen">
      <ImagePopup />
      <Header />
      {layout.filter((e) => e.visible).map((e) => (
        <Fragment key={e.key}>{sectionByKey.get(e.key)?.render()}</Fragment>
      ))}
      <Footer />
    </div>;
};
export default Index;
