import NewsForm from "@/components/NewsForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NewsFormPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">ระบบประชาสัมพันธ์</h1>
          <p className="text-lg text-muted-foreground">จัดการข่าวสาร ประกาศ และกิจกรรมของโรงเรียน</p>
        </div>
        <NewsForm />
      </main>
      <Footer />
    </div>
  );
};

export default NewsFormPage;