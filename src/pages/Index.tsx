import { Fragment } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImagePopup from "@/components/ImagePopup";
import { HOME_SECTIONS } from "@/components/home/homeSections";
import { useHomeLayout } from "@/lib/homeLayout";

const sectionByKey = new Map(HOME_SECTIONS.map((s) => [s.key, s]));

const Index = () => {
  // Admins choose the order / visibility of these sections in the dashboard
  const layout = useHomeLayout();
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
