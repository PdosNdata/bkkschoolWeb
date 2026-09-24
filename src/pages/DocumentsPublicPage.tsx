import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import DocumentTable from "@/components/DocumentTable";
import { useDocumentTypes, documentsTable, type SchoolDocument } from "@/lib/documents";

const ALL = "ทั้งหมด";

const DocumentsPublicPage = () => {
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(ALL);
  const { types } = useDocumentTypes();

  // Managed types, plus any type still used by an existing document
  const FILTERS = useMemo(
    () => [ALL, ...new Set([...types, ...documents.map((d) => d.doc_type)])],
    [types, documents],
  );

  useEffect(() => {
    documentsTable()
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: SchoolDocument[] | null }) => {
        setDocuments((data ?? []) as SchoolDocument[]);
        setLoading(false);
      });
  }, []);

  const visible = useMemo(
    () => (filter === ALL ? documents : documents.filter((d) => d.doc_type === filter)),
    [documents, filter],
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">นวัตกรรมการเรียนรู้</h1>
          <p className="text-muted-foreground mt-1">
            เอกสารเผยแพร่ของโรงเรียนบ้านค้อดอนแคน — แผนการจัดการการเรียนรู้ นวัตกรรมการเรียนรู้ และหลักสูตรโรงเรียน
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังโหลด...
              </div>
            ) : (
              <DocumentTable documents={visible} readOnly />
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default DocumentsPublicPage;
