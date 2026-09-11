import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Swal from "sweetalert2";
import { supabase } from "@/integrations/supabase/client";
import DocumentTable from "@/components/DocumentTable";
import {
  DOCUMENT_TYPES,
  DOCUMENTS_BUCKET,
  DOCUMENTS_PREFIX,
  documentsTable,
  type DocumentType,
  type SchoolDocument,
} from "@/lib/documents";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  title: "",
  doc_date: today(),
  doc_type: "" as DocumentType | "",
});

const uploadFile = async (file: File) => {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${DOCUMENTS_PREFIX}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, name: file.name, type: file.type || null };
};

const DocumentUploadPage = () => {
  const { toast } = useToast();

  const [form, setForm] = useState(emptyForm());
  const [file, setFile] = useState<File | null>(null);
  const [uploadedBy, setUploadedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<SchoolDocument | null>(null);
  const [editForm, setEditForm] = useState(emptyForm());
  const [editFile, setEditFile] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await documentsTable()
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "โหลดรายการไม่สำเร็จ", description: error.message, variant: "destructive" });
    } else {
      setDocuments((data ?? []) as SchoolDocument[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setCurrentUserId(user.id);
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).eq("approved", true),
      ]);
      setUploadedBy(profile?.display_name?.trim() || user.email?.split("@")[0] || "");
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
    });
  }, []);

  const canSubmit = useMemo(
    () => form.title.trim() && form.doc_date && form.doc_type && file && uploadedBy.trim() && !submitting,
    [form, file, uploadedBy, submitting],
  );

  const resetForm = () => {
    setForm(emptyForm());
    setFile(null);
    const input = document.getElementById("doc-file") as HTMLInputElement | null;
    if (input) input.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !form.doc_type) return;
    setSubmitting(true);
    try {
      const uploaded = await uploadFile(file);
      const { error } = await documentsTable().insert({
        title: form.title.trim(),
        doc_date: form.doc_date,
        doc_type: form.doc_type,
        file_url: uploaded.url,
        file_name: uploaded.name,
        file_type: uploaded.type,
        uploaded_by: uploadedBy.trim(),
        user_id: currentUserId,
      });
      if (error) throw error;
      toast({ title: "อัพโหลดเอกสารสำเร็จ" });
      resetForm();
      fetchDocuments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "กรุณาลองใหม่อีกครั้ง";
      toast({ title: "อัพโหลดไม่สำเร็จ", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (doc: SchoolDocument) => {
    setEditing(doc);
    setEditForm({ title: doc.title, doc_date: doc.doc_date, doc_type: doc.doc_type });
    setEditFile(null);
  };

  const handleSaveEdit = async () => {
    if (!editing || !editForm.doc_type) return;
    setSavingEdit(true);
    try {
      const patch: Record<string, unknown> = {
        title: editForm.title.trim(),
        doc_date: editForm.doc_date,
        doc_type: editForm.doc_type,
      };
      if (editFile) {
        const uploaded = await uploadFile(editFile);
        patch.file_url = uploaded.url;
        patch.file_name = uploaded.name;
        patch.file_type = uploaded.type;
      }
      const { error } = await documentsTable().update(patch).eq("id", editing.id);
      if (error) throw error;
      toast({ title: "บันทึกการแก้ไขแล้ว" });
      setEditing(null);
      fetchDocuments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "กรุณาลองใหม่อีกครั้ง";
      toast({ title: "บันทึกไม่สำเร็จ", description: message, variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (doc: SchoolDocument) => {
    const result = await Swal.fire({
      title: "ลบเอกสารนี้?",
      text: doc.title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบออก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;

    const { error } = await documentsTable().delete().eq("id", doc.id);
    if (error) {
      toast({ title: "ลบไม่สำเร็จ", description: error.message, variant: "destructive" });
      return;
    }
    // best-effort: remove the stored file too
    try {
      const marker = `/${DOCUMENTS_BUCKET}/`;
      const idx = doc.file_url.indexOf(marker);
      if (idx !== -1) {
        const path = decodeURIComponent(doc.file_url.slice(idx + marker.length));
        await supabase.storage.from(DOCUMENTS_BUCKET).remove([path]);
      }
    } catch {
      /* ignore */
    }
    toast({ title: "ลบเอกสารแล้ว" });
    fetchDocuments();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">อัพโหลดเอกสาร</h1>
          <p className="text-muted-foreground mt-1">
            แผนการจัดการการเรียนรู้ · นวัตกรรมการเรียนรู้ · หลักสูตรโรงเรียน
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">เพิ่มเอกสารใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="doc-title">ชื่อเอกสาร</Label>
                <Input
                  id="doc-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="เช่น แผนการสอนวิชาวิทยาศาสตร์ ป.5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-date">วันที่</Label>
                <Input
                  id="doc-date"
                  type="date"
                  value={form.doc_date}
                  onChange={(e) => setForm((f) => ({ ...f, doc_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>ประเภทเอกสาร</Label>
                <Select
                  value={form.doc_type}
                  onValueChange={(v) => setForm((f) => ({ ...f, doc_type: v as DocumentType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-file">แนบไฟล์ (ทุกประเภท)</Label>
                <Input
                  id="doc-file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-uploader">ผู้อัพโหลด</Label>
                <Input
                  id="doc-uploader"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" disabled={!canSubmit}>
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังอัพโหลด...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> อัพโหลดเอกสาร</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายการเอกสารทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังโหลด...
              </div>
            ) : (
              <DocumentTable
                documents={documents}
                onEdit={openEdit}
                onDelete={handleDelete}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขเอกสาร</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">ชื่อเอกสาร</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">วันที่</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.doc_date}
                onChange={(e) => setEditForm((f) => ({ ...f, doc_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>ประเภทเอกสาร</Label>
              <Select
                value={editForm.doc_type}
                onValueChange={(v) => setEditForm((f) => ({ ...f, doc_type: v as DocumentType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-file">เปลี่ยนไฟล์ (ไม่บังคับ)</Label>
              <Input
                id="edit-file"
                type="file"
                onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
              />
              {editing && !editFile && (
                <p className="text-xs text-muted-foreground">ไฟล์ปัจจุบัน: {editing.file_name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={savingEdit}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit || !editForm.title.trim() || !editForm.doc_type}>
              {savingEdit ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentUploadPage;
