import type { ReactNode } from "react";
import ImageSlider from "@/components/ImageSlider";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ActivitiesSection from "@/components/ActivitiesSection";
import NewsSection from "@/components/NewsSection";
import ContactSection from "@/components/ContactSection";

const ContactInfoSection = () => (
  <section id="contact" className="py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">ติดต่อเรา</h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">สามารถติดต่อสอบถามข้อมูลเพิ่มเติมได้ที่</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-2">โทรศัพท์</h3>
          <p className="text-muted-foreground">-</p>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-2">อีเมล</h3>
          <p className="text-muted-foreground">41030208@udonthani3.go.th</p>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-2">ที่อยู่</h3>
          <p className="text-muted-foreground">เลขที่ 93 หมู่ที่ 3 ตำบลค้อใหญ่ อำเภอกู่แก้ว จังหวัดอุดรธานี 41130</p>
        </div>
      </div>
    </div>
  </section>
);

export interface HomeSectionDef {
  key: string;
  label: string;
  description: string;
  render: () => ReactNode;
}

// Default order = the layout the site had before it became configurable.
export const HOME_SECTIONS: HomeSectionDef[] = [
  { key: "slider", label: "สไลด์ภาพหน้าแรก", description: "แถบภาพเลื่อนด้านบน", render: () => <ImageSlider /> },
  { key: "hero", label: "โรงเรียนด้วยรักและห่วงใย + การ์ดเมนูสำคัญ", description: "วิดีโอ กิจกรรมโครงการ และการ์ด 5 ใบ", render: () => <HeroSection /> },
  { key: "about", label: "ประวัติโรงเรียน", description: "ภาพประวัติ สถิติ วิสัยทัศน์ พันธกิจ เป้าประสงค์", render: () => <div className="bg-muted/30"><AboutSection /></div> },
  { key: "activities", label: "กิจกรรมสร้างสรรค์", description: "การ์ดกิจกรรมภายใน/ภายนอก", render: () => <div className="bg-pink-50/70"><ActivitiesSection /></div> },
  { key: "news", label: "ข่าวสารและประกาศ", description: "การ์ดข่าวล่าสุด", render: () => <div className="bg-muted/30"><NewsSection /></div> },
  { key: "contact_cards", label: "ช่องทางติดต่อ / แผนที่", description: "ส่วนข้อมูลติดต่อหลัก", render: () => <div className="bg-pink-50/70"><ContactSection /></div> },
  { key: "contact_info", label: "ติดต่อเรา (โทร/อีเมล/ที่อยู่)", description: "ข้อมูลติดต่อสรุป", render: () => <div className="bg-muted/30"><ContactInfoSection /></div> },
];

export interface LayoutEntry {
  key: string;
  visible: boolean;
}

export const DEFAULT_LAYOUT: LayoutEntry[] = HOME_SECTIONS.map((s) => ({ key: s.key, visible: true }));

/** Saved layout merged with the known sections: unknown keys dropped, new sections appended. */
export const normalizeLayout = (saved: unknown): LayoutEntry[] => {
  const known = new Set(HOME_SECTIONS.map((s) => s.key));
  const out: LayoutEntry[] = [];
  const seen = new Set<string>();
  if (Array.isArray(saved)) {
    for (const e of saved as Partial<LayoutEntry>[]) {
      if (e && typeof e.key === "string" && known.has(e.key) && !seen.has(e.key)) {
        out.push({ key: e.key, visible: e.visible !== false });
        seen.add(e.key);
      }
    }
  }
  for (const s of HOME_SECTIONS) if (!seen.has(s.key)) out.push({ key: s.key, visible: true });
  return out;
};
