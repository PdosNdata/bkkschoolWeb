import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MediaForm from "@/components/MediaForm";

const MediaFormPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">คลังสื่อออนไลน์</h1>
          <p className="text-lg text-muted-foreground">เพิ่มและจัดการสื่อการเรียนรู้ออนไลน์</p>
        </div>

        <MediaForm />
      </main>

      <Footer />
    </div>
  );
};

export default MediaFormPage;