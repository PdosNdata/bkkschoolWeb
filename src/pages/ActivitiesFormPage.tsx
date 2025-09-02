import ActivitiesForm from "@/components/ActivitiesForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ActivitiesFormPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">กิจกรรมภายในโรงเรียน</h1>
          <p className="text-lg text-muted-foreground">จัดการกิจกรรมและข้อมูลกิจกรรมของโรงเรียน</p>
        </div>
        <ActivitiesForm />
      </main>
      <Footer />
    </div>
  );
};

export default ActivitiesFormPage;