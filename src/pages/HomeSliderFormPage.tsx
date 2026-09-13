import HomeSliderForm from "@/components/HomeSliderForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HomeSliderFormPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">จัดการสไลด์หน้าแรก</h1>
          <p className="text-lg text-muted-foreground">เพิ่ม/แก้ไข/ลบรูปภาพที่แสดงในสไลด์บนหน้าแรกของเว็บไซต์</p>
        </div>
        <HomeSliderForm />
      </main>
      <Footer />
    </div>
  );
};

export default HomeSliderFormPage;
