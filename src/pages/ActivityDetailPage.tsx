import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Share2, Facebook, ArrowLeft, Download, Loader2, CalendarDays, UserRound, Image as ImageIcon, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [downloadingAll, setDownloadingAll] = useState(false);

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

  const downloadImage = async (url: string, index: number) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const ext = blob.type.split("/")[1] || "jpg";
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${activity?.title || "activity"}-${index + 1}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank", "noopener");
    }
  };

  const downloadAllImages = async () => {
    if (!activity?.images?.length) return;
    setDownloadingAll(true);
    try {
      for (let i = 0; i < activity.images.length; i++) {
        await downloadImage(activity.images[i], i);
        // small gap so the browser doesn't block multiple simultaneous downloads
        await new Promise((r) => setTimeout(r, 400));
      }
    } finally {
      setDownloadingAll(false);
    }
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-violet-50 via-pink-50/60 to-sky-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link to="/" className="inline-block">
            <Button
              variant="outline"
              className="rounded-full border-purple-300 bg-white/80 font-semibold text-purple-700 shadow-sm backdrop-blur hover:bg-purple-600 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าแรก
            </Button>
          </Link>

          {/* Title banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-xl shadow-purple-500/30 ring-1 ring-white/30">
            <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/15" />
            <span aria-hidden className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="relative">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-bold ring-1 ring-white/40 backdrop-blur-sm">
                <CalendarDays className="h-3.5 w-3.5" /> กิจกรรมโรงเรียน
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight drop-shadow-sm">{activity.title}</h1>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-medium backdrop-blur-sm">
                    <UserRound className="h-4 w-4" /> {activity.author_name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 font-medium backdrop-blur-sm">
                    <CalendarDays className="h-4 w-4" /> {formatDate(activity.created_at)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCopyLink} className="rounded-full bg-white text-purple-700 shadow hover:bg-purple-50">
                    <Share2 className="w-4 h-4 mr-2" />
                    คัดลอกลิงก์
                  </Button>
                  <Button size="sm" onClick={handleShareFacebook} className="rounded-full bg-[#1877F2] text-white shadow hover:bg-[#1465d0]">
                    <Facebook className="w-4 h-4 mr-2" />
                    แชร์
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Images gallery */}
          {activity.images && activity.images.length > 0 && (
            <section className="rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 p-[3px] shadow-xl shadow-blue-400/30">
              <div className="rounded-[1.35rem] bg-gradient-to-b from-sky-50 to-white p-4 md:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="inline-flex items-center gap-2 text-lg font-bold text-blue-700">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow">
                      <ImageIcon className="h-4 w-4" />
                    </span>
                    ภาพกิจกรรม ({activity.images.length} ภาพ)
                  </h2>
                  {activity.images.length > 1 && (
                    <Button
                      size="sm"
                      onClick={downloadAllImages}
                      disabled={downloadingAll}
                      className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow hover:opacity-90"
                    >
                      {downloadingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      ดาวน์โหลดทั้งหมด
                    </Button>
                  )}
                </div>

                {/* Main image: shown whole (never cropped) on a blurred copy of itself */}
                <div className="relative mb-3 overflow-hidden rounded-2xl bg-slate-900 shadow-inner">
                  <img
                    src={activity.images[selectedImage]}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
                  />
                  <img
                    src={activity.images[selectedImage]}
                    alt={activity.title}
                    className="relative mx-auto block max-h-[560px] w-full object-contain"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-3 right-3 rounded-full bg-white/90 font-semibold text-blue-700 shadow-lg backdrop-blur hover:bg-white"
                    onClick={() => downloadImage(activity.images[selectedImage], selectedImage)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ดาวน์โหลดภาพนี้
                  </Button>
                </div>

                {activity.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                    {activity.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                          selectedImage === index
                            ? "scale-105 border-blue-500 shadow-lg shadow-blue-400/50 ring-2 ring-blue-300"
                            : "border-transparent opacity-80 hover:-translate-y-0.5 hover:border-sky-300 hover:opacity-100"
                        }`}
                        aria-label={`ดูภาพที่ ${index + 1}`}
                      >
                        <img src={image} alt={`${activity.title} - ภาพที่ ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Content */}
          <section className="rounded-3xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 p-[3px] shadow-xl shadow-emerald-400/30">
            <div className="rounded-[1.35rem] bg-gradient-to-b from-emerald-50 to-white p-5 md:p-8">
              <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-bold text-emerald-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow">
                  <FileText className="h-4 w-4" />
                </span>
                รายละเอียดกิจกรรม
              </h2>
              <div className="whitespace-pre-wrap text-lg leading-relaxed text-gray-800">{activity.content}</div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ActivityDetailPage;
