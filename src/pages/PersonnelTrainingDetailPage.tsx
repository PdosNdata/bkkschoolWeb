import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DocumentShareActions from "@/components/DocumentShareActions";
import { ArrowLeft, Download, ExternalLink, FileQuestion, Loader2 } from "lucide-react";
import { downloadDocument, withShareVersion } from "@/lib/documents";
import {
  formatTrainingDate,
  formatTrainingRange,
  trainingPageUrl,
  trainingsTable,
  type TeacherTraining,
} from "@/lib/trainings";

const imageName = (t: TeacherTraining, src: string, i: number) => {
  const ext = src.split("?")[0].split(".").pop() || "jpg";
  return `${t.title}-${i + 1}.${ext}`;
};

const downloadImage = (t: TeacherTraining, src: string, i: number) =>
  downloadDocument({ file_url: src, file_name: imageName(t, src, i), title: t.title });

const downloadAllImages = async (t: TeacherTraining) => {
  const images = t.images ?? [];
  for (let i = 0; i < images.length; i++) {
    await downloadImage(t, images[i], i);
    // small gap so the browser doesn't block several downloads at once
    await new Promise((r) => setTimeout(r, 400));
  }
};

const PersonnelTrainingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<TeacherTraining | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    trainingsTable()
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }: { data: TeacherTraining | null }) => {
        setRecord(data);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังโหลด...
          </div>
        ) : !record ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <FileQuestion className="w-10 h-10 mx-auto mb-3" />
              ไม่พบรายการนี้
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">การอบรม ประชุม สัมมนาของครู</p>
                <h1 className="text-2xl font-bold text-foreground">{record.title}</h1>
                <dl className="mt-4 grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">ครู/บุคลากร</dt>
                  <dd className="font-medium">{record.teacher_name}</dd>
                  <dt className="text-muted-foreground">วันที่อบรม</dt>
                  <dd>{formatTrainingRange(record)}</dd>
                  {record.organizer && (
                    <>
                      <dt className="text-muted-foreground">อบรมโดย</dt>
                      <dd>{record.organizer}</dd>
                    </>
                  )}
                  <dt className="text-muted-foreground">วันที่รายงาน</dt>
                  <dd>{formatTrainingDate(record.report_date)}</dd>
                </dl>
              </div>

              {record.details && (
                <div>
                  <h2 className="font-semibold mb-1">รายละเอียด</h2>
                  <p className="text-sm whitespace-pre-wrap text-foreground/90">{record.details}</p>
                </div>
              )}

              {record.images && record.images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold">ภาพประกอบ ({record.images.length} รูป)</h2>
                    {record.images.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => downloadAllImages(record)}>
                        <Download className="w-4 h-4 mr-2" /> ดาวน์โหลดทั้งหมด
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {record.images.map((src, i) => (
                      <div key={src} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                        <a href={src} target="_blank" rel="noopener noreferrer">
                          <img src={src} alt={`${record.title} รูปที่ ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        </a>
                        <button
                          type="button"
                          onClick={() => downloadImage(record, src, i)}
                          className="absolute bottom-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          title="ดาวน์โหลดภาพนี้"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <DocumentShareActions doc={record} url={withShareVersion(trainingPageUrl(record.id))} />
                {record.certificate_url && (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <a href={record.certificate_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> เปิดเกียรติบัตร
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        downloadDocument({
                          file_url: record.certificate_url as string,
                          file_name: record.certificate_name ?? record.title,
                          title: record.title,
                        })
                      }
                    >
                      <Download className="w-4 h-4 mr-2" /> ดาวน์โหลดเกียรติบัตร
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าแรก
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PersonnelTrainingDetailPage;
