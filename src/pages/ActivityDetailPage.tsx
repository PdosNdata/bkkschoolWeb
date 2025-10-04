import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Share2, Facebook, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface Activity {
  id: string;
  title: string;
  content: string;
  author_name: string;
  images: string[];
  cover_image_index: number;
  created_at: string;
}

const ActivityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchActivity();
    }
  }, [id]);

  const fetchActivity = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching activity:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลกิจกรรมได้",
        variant: "destructive",
      });
    } else {
      setActivity(data);
      setSelectedImage(data.cover_image_index || 0);
    }
    setLoading(false);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "คัดลอกลิงก์สำเร็จ",
      description: "คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว",
    });
  };

  const handleShareFacebook = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-lg">กำลังโหลด...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg mb-4">ไม่พบข้อมูลกิจกรรม</p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าแรก
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-block mb-6">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าแรก
            </Button>
          </Link>

          <Card>
            <CardContent className="pt-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{activity.title}</h1>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    <span>โดย {activity.author_name}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(activity.created_at)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      คัดลอกลิงก์
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareFacebook}
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      แชร์
                    </Button>
                  </div>
                </div>
              </div>

              {/* Images Gallery */}
              {activity.images && activity.images.length > 0 && (
                <div className="mb-6">
                  {/* Main Image */}
                  <div className="mb-4">
                    <img
                      src={activity.images[selectedImage]}
                      alt={activity.title}
                      className="w-full h-[500px] object-cover rounded-lg"
                    />
                  </div>

                  {/* Thumbnails */}
                  {activity.images.length > 1 && (
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {activity.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index
                              ? "border-primary scale-105"
                              : "border-transparent hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${activity.title} - ภาพที่ ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-lg leading-relaxed">
                  {activity.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ActivityDetailPage;
