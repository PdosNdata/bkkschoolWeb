import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, ExternalLink, Download, Share2, Link2, Loader2, FileQuestion } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { documentsTable, type SchoolDocument } from "@/lib/documents";
import LineIcon from "@/components/LineIcon";

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return value;
  }
};

const DocumentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [doc, setDoc] = useState<SchoolDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    documentsTable()
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }: { data: SchoolDocument | null }) => {
        if (data) setDoc(data);
        else setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast({ title: "คัดลอกลิงก์แล้ว" });
    } catch {
      toast({ title: "คัดลอกไม่สำเร็จ", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (!doc) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: doc.title, url: pageUrl });
        return;
      } catch {
        /* cancelled — fall through */
      }
    }
    handleCopy();
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
      "facebook-share",
      "width=600,height=400,scrollbars=yes,resizable=yes",
    );
  };

  const shareLine = () => {
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl)}`,
      "line-share",
      "width=500,height=600,scrollbars=yes,resizable=yes",
    );
  };

  const handleDownload = async () => {
    if (!doc) return;
    try {
      const res = await fetch(doc.file_url);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name || doc.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(doc.file_url, "_blank", "noopener");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-2xl">
        <Link to="/documents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> กลับไปหน้ารายการเอกสาร
        </Link>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังโหลด...
          </div>
        ) : notFound || !doc ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <FileQuestion className="w-10 h-10 mx-auto mb-3" />
              ไม่พบเอกสารนี้
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3">{doc.doc_type}</Badge>
                <h1 className="text-2xl font-bold text-foreground">{doc.title}</h1>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground max-w-sm">
                  <dt>วันที่</dt><dd>{formatDate(doc.doc_date)}</dd>
                  <dt>ผู้อัพโหลด</dt><dd>{doc.uploaded_by}</dd>
                  <dt>ไฟล์</dt><dd className="truncate">{doc.file_name}</dd>
                </dl>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" /> เปิดไฟล์
                  </a>
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" /> ดาวน์โหลด
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" /> แชร์
                </Button>
                <Button variant="outline" onClick={shareLine} className="text-[#06C755] border-[#06C755]/40 hover:bg-[#06C755]/10">
                  <LineIcon className="w-4 h-4 mr-2" /> LINE
                </Button>
                <Button variant="outline" onClick={shareFacebook} className="text-[#1877F2] border-[#1877F2]/40 hover:bg-[#1877F2]/10">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.5-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/></svg>
                  Facebook
                </Button>
                <Button variant="outline" onClick={handleCopy}>
                  <Link2 className="w-4 h-4 mr-2" /> คัดลอกลิงก์
                </Button>
              </div>

              <div className="flex flex-col items-center gap-2 pt-4 border-t">
                <p className="text-sm text-muted-foreground">สแกน QR เพื่อเปิดไฟล์</p>
                <div className="rounded-lg bg-white p-3 border">
                  <QRCodeCanvas value={doc.file_url} size={144} marginSize={2} level="M" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DocumentDetailPage;
