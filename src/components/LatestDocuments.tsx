import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { documentsTable, downloadDocument, type SchoolDocument } from "@/lib/documents";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });

/** Latest public documents with one-click download, shown on the home page. */
const LatestDocuments = () => {
  const { data: documents = [] } = useQuery({
    queryKey: ["latest-documents"],
    queryFn: async () => {
      const { data, error } = await documentsTable()
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as SchoolDocument[];
    },
  });

  if (documents.length === 0) return null;

  return (
    <div className="mt-12 max-w-4xl mx-auto text-left">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-violet-950 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-600" />
          เอกสารดาวน์โหลดล่าสุด
        </h3>
        <Button asChild variant="link" className="text-violet-900">
          <Link to="/documents">ดูเอกสารทั้งหมด</Link>
        </Button>
      </div>
      <Card className="border border-black/5 shadow-md">
        <CardContent className="p-0 divide-y">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <Link to={`/documents/${doc.id}`} className="font-medium text-foreground hover:text-primary line-clamp-2">
                  {doc.title}
                </Link>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Badge variant="secondary">{doc.doc_type}</Badge>
                  <span>{formatDate(doc.doc_date)}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0" onClick={() => downloadDocument(doc)}>
                <Download className="w-4 h-4 mr-1" />
                ดาวน์โหลด
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default LatestDocuments;
