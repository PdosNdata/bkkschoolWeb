import { useRef } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pencil, Trash2, QrCode, Download } from "lucide-react";
import DocumentShareActions from "@/components/DocumentShareActions";
import type { SchoolDocument } from "@/lib/documents";

interface DocumentTableProps {
  documents: SchoolDocument[];
  readOnly?: boolean;
  onEdit?: (doc: SchoolDocument) => void;
  onDelete?: (doc: SchoolDocument) => void;
  /** Current viewer's id and whether they're an admin — only the document's
   * own uploader (or an admin) gets the edit/delete buttons. */
  currentUserId?: string | null;
  isAdmin?: boolean;
}

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return value;
  }
};

const DocumentTable = ({
  documents,
  readOnly = false,
  onEdit,
  onDelete,
  currentUserId = null,
  isAdmin = false,
}: DocumentTableProps) => {
  const handleDownload = async (doc: SchoolDocument) => {
    try {
      const res = await fetch(doc.file_url);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name || doc.title || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(doc.file_url, "_blank", "noopener");
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        ยังไม่มีเอกสาร
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">วันที่</TableHead>
            <TableHead>ชื่อเอกสาร</TableHead>
            <TableHead className="whitespace-nowrap">ประเภท</TableHead>
            <TableHead className="whitespace-nowrap">ผู้อัพโหลด</TableHead>
            <TableHead className="whitespace-nowrap text-center">QR โค้ด</TableHead>
            <TableHead className="text-right whitespace-nowrap">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const canManage = isAdmin || (!!currentUserId && doc.user_id === currentUserId);
            return (
            <TableRow key={doc.id}>
              <TableCell className="whitespace-nowrap">{formatDate(doc.doc_date)}</TableCell>
              <TableCell>
                <Link to={`/documents/${doc.id}`} className="font-medium text-primary hover:underline">
                  {doc.title}
                </Link>
                <div className="text-xs text-muted-foreground">{doc.file_name}</div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant="secondary">{doc.doc_type}</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">{doc.uploaded_by}</TableCell>
              <TableCell className="text-center">
                <QrCell doc={doc} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <DocumentShareActions doc={doc} />
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} title="ดาวน์โหลด">
                    <Download className="w-4 h-4" />
                  </Button>
                  {!readOnly && onEdit && canManage && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(doc)} title="แก้ไข">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                  {!readOnly && onDelete && canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(doc)}
                      title="ลบออก"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const QrCell = ({ doc }: { doc: SchoolDocument }) => {
  const boxRef = useRef<HTMLDivElement>(null);

  const saveQr = () => {
    const canvas = boxRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${doc.title || doc.id}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" title="QR โค้ดลิงก์ไฟล์" className="mx-auto">
          <QrCode className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto flex flex-col items-center gap-3 p-4">
        <p className="text-sm font-medium text-center max-w-[220px]">{doc.title}</p>
        <div ref={boxRef} className="rounded-lg bg-white p-3">
          <QRCodeCanvas value={doc.file_url} size={176} marginSize={2} level="M" />
        </div>
        <p className="text-xs text-muted-foreground">สแกนเพื่อเปิดไฟล์</p>
        <Button size="sm" variant="outline" onClick={saveQr}>
          <Download className="w-4 h-4 mr-2" />
          บันทึกรูป QR
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default DocumentTable;
