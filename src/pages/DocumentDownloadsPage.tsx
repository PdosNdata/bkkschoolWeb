import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocumentShareActions from "@/components/DocumentShareActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { useDocumentTypes, documentsTable, downloadDocument, type SchoolDocument } from "@/lib/documents";

const ALL = "ทั้งหมด";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });

const DocumentDownloadsPage = () => {
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(ALL);
  const { types } = useDocumentTypes();

  useEffect(() => {
    documentsTable()
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: SchoolDocument[] | null }) => {
        setDocuments((data ?? []) as SchoolDocument[]);
        setLoading(false);
      });
  }, []);

  // Managed types, plus any type still used by an existing document
  const filters = useMemo(
    () => [ALL, ...new Set([...types, ...documents.map((d) => d.doc_type)])],
    [types, documents],
  );

  const visible = useMemo(
    () => (filter === ALL ? documents : documents.filter((d) => d.doc_type === filter)),
    [documents, filter],
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">ดาวน์โหลดเอกสาร</h1>
          <p className="text-muted-foreground mt-1">
            เอกสารของโรงเรียนบ้านค้อดอนแคน — กดปุ่มดาวน์โหลดเพื่อบันทึกไฟล์ได้ทันที
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f}
            </Button>
          ))}
        </div>

        <Card>
          <CardContent className="p-0 divide-y">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังโหลด...
              </div>
            ) : visible.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">ยังไม่มีเอกสาร</div>
            ) : (
              visible.map((doc) => (
                <div key={doc.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex-1 min-w-0">
                    <Link to={`/documents/${doc.id}`} className="font-medium text-foreground hover:text-primary line-clamp-2">
                      {doc.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Badge variant="secondary">{doc.doc_type}</Badge>
                      <span>{formatDate(doc.doc_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:shrink-0">
                    <DocumentShareActions doc={doc} />
                    <Button size="sm" variant="outline" onClick={() => downloadDocument(doc)}>
                      <Download className="w-4 h-4 mr-1" />
                      ดาวน์โหลด
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default DocumentDownloadsPage;
