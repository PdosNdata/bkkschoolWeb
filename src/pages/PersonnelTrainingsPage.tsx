import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DocumentShareActions from "@/components/DocumentShareActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, Pencil, Trash2, Plus, X, Download } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { withTimeout } from "@/lib/utils";
import { downloadDocument, withShareVersion } from "@/lib/documents";
import {
  TRAININGS_BUCKET,
  TRAININGS_PREFIX,
  formatTrainingDate,
  formatTrainingRange,
  trainingPageUrl,
  trainingsTable,
  type TeacherTraining,
} from "@/lib/trainings";

interface PersonOption {
  id: string;
  full_name: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  personnel_id: "",
  report_date: today(),
  start_date: today(),
  end_date: "",
  title: "",
  details: "",
  organizer: "",
});

const MAX_FILE_MB = 20;

const PersonnelTrainingsPage = () => {
  const { toast } = useToast();

  const [people, setPeople] = useState<PersonOption[]>([]);
  const [records, setRecords] = useState<TeacherTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [form, setForm] = useState(emptyForm());
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<TeacherTraining | null>(null);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await trainingsTable().select("*").order("start_date", { ascending: false });
    if (error) {
      toast({ title: "โหลดรายการไม่สำเร็จ", description: error.message, variant: "destructive" });
    } else {
      setRecords((data ?? []) as TeacherTraining[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
    supabase
      .from("personnel")
      .select("id, full_name")
      .order("full_name", { ascending: true })
      .then(({ data }) => setPeople((data ?? []) as PersonOption[]));

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setCurrentUserId(user.id);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("approved", true);
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter(
      (r) => !q || r.teacher_name.toLowerCase().includes(q) || r.title.toLowerCase().includes(q),
    );
  }, [records, search]);

  const resetForm = () => {
    setForm(emptyForm());
    setFile(null);
    setEditing(null);
    const input = document.getElementById("training-file") as HTMLInputElement | null;
    if (input) input.value = "";
  };

  const startEdit = (r: TeacherTraining) => {
    setEditing(r);
    setFile(null);
    setForm({
      personnel_id: r.personnel_id ?? "",
      report_date: r.report_date,
      start_date: r.start_date,
      end_date: r.end_date ?? "",
      title: r.title,
      details: r.details ?? "",
      organizer: r.organizer ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > MAX_FILE_MB * 1024 * 1024) {
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: `เลือกไฟล์ไม่เกิน ${MAX_FILE_MB}MB (ไฟล์นี้ ${(f.size / 1024 / 1024).toFixed(1)}MB)`,
        variant: "destructive",
      });
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const person = people.find((p) => p.id === form.personnel_id);
    if (!person) {
      toast({ title: "กรุณาเลือกครู/บุคลากร", variant: "destructive" });
      return;
    }
    if (form.end_date && form.end_date < form.start_date) {
      toast({ title: "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        personnel_id: person.id,
        teacher_name: person.full_name,
        report_date: form.report_date,
        title: form.title.trim(),
        details: form.details.trim() || null,
        organizer: form.organizer.trim() || null,
        start_date: form.start_date,
        end_date: form.end_date || null,
      };

      if (file) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${TRAININGS_PREFIX}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await withTimeout(
          supabase.storage.from(TRAININGS_BUCKET).upload(path, file),
          90000,
          "อัพโหลดเกียรติบัตร",
        );
        if (upErr) throw upErr;
        payload.certificate_url = supabase.storage.from(TRAININGS_BUCKET).getPublicUrl(path).data.publicUrl;
        payload.certificate_name = file.name;
      }

      if (editing) {
        const { error } = await withTimeout(
          trainingsTable().update(payload).eq("id", editing.id) as Promise<{ error: Error | null }>,
          20000,
          "บันทึกข้อมูล",
        );
        if (error) throw error;
        toast({ title: "บันทึกการแก้ไขแล้ว" });
      } else {
        const { error } = await withTimeout(
          trainingsTable().insert({ ...payload, user_id: currentUserId }) as Promise<{ error: Error | null }>,
          20000,
          "บันทึกข้อมูล",
        );
        if (error) throw error;
        toast({ title: "เพิ่มรายการแล้ว" });
      }
      resetForm();
      fetchRecords();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "กรุณาลองใหม่อีกครั้ง";
      toast({ title: "บันทึกไม่สำเร็จ", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: TeacherTraining) => {
    const res = await Swal.fire({
      title: "ลบรายการนี้?",
      text: `${r.teacher_name} — ${r.title}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบออก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!res.isConfirmed) return;
    const { error } = await trainingsTable().delete().eq("id", r.id);
    if (error) {
      toast({ title: "ลบไม่สำเร็จ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "ลบรายการแล้ว" });
    if (editing?.id === r.id) resetForm();
    fetchRecords();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">การอบรม ประชุม สัมมนาของครู</h1>
              <p className="text-gray-600">บันทึกและติดตามการพัฒนาตนเองของครูและบุคลากร</p>
            </div>
            <Link to="/personnel">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับระบบบุคลากร
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {editing ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
                {editing && (
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    <X className="w-4 h-4 mr-1" /> ยกเลิกการแก้ไข
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ครู/บุคลากร</Label>
                  <Select value={form.personnel_id} onValueChange={(v) => setForm((f) => ({ ...f, personnel_id: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกครู/บุคลากร" />
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-report">วันที่รายงาน</Label>
                  <Input
                    id="training-report"
                    type="date"
                    value={form.report_date}
                    onChange={(e) => setForm((f) => ({ ...f, report_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-start">วันที่อบรม</Label>
                  <Input
                    id="training-start"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-end">ถึงวันที่</Label>
                  <Input
                    id="training-end"
                    type="date"
                    value={form.end_date}
                    min={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="training-title">เรื่อง</Label>
                  <Input
                    id="training-title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="เช่น การพัฒนาสื่อการสอนด้วย AI"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="training-details">รายละเอียด</Label>
                  <Textarea
                    id="training-details"
                    rows={3}
                    value={form.details}
                    onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-organizer">อบรมโดย</Label>
                  <Input
                    id="training-organizer"
                    value={form.organizer}
                    onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))}
                    placeholder="เช่น สพป.อุดรธานี เขต 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="training-file">เกียรติบัตร (ไม่บังคับ)</Label>
                  <Input id="training-file" type="file" onChange={onFileChange} />
                  {editing?.certificate_name && !file && (
                    <p className="text-xs text-muted-foreground">ไฟล์ปัจจุบัน: {editing.certificate_name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                    {saving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังบันทึก...</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" /> {editing ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">รายการทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อครูหรือเรื่อง..."
                  className="sm:max-w-sm"
                />
                <div className="sm:ml-auto text-sm text-muted-foreground">{visible.length} รายการ</div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังโหลด...
                </div>
              ) : visible.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">ยังไม่มีรายการ</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">วันที่อบรม</TableHead>
                        <TableHead>ครู/บุคลากร</TableHead>
                        <TableHead>เรื่อง</TableHead>
                        <TableHead className="whitespace-nowrap">วันที่รายงาน</TableHead>
                        <TableHead className="text-right whitespace-nowrap">จัดการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visible.map((r) => {
                        const canManage = isAdmin || (!!currentUserId && r.user_id === currentUserId);
                        return (
                          <TableRow key={r.id}>
                            <TableCell className="whitespace-nowrap">{formatTrainingRange(r)}</TableCell>
                            <TableCell className="font-medium">{r.teacher_name}</TableCell>
                            <TableCell>
                              <Link to={`/personnel-trainings/${r.id}`} className="font-medium text-primary hover:underline">
                                {r.title}
                              </Link>
                              {r.organizer && <div className="text-xs text-muted-foreground">อบรมโดย {r.organizer}</div>}
                              {r.details && <div className="text-xs text-muted-foreground line-clamp-2">{r.details}</div>}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{formatTrainingDate(r.report_date)}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <DocumentShareActions doc={r} url={withShareVersion(trainingPageUrl(r.id))} />
                                {r.certificate_url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="ดาวน์โหลดเกียรติบัตร"
                                    onClick={() =>
                                      downloadDocument({
                                        file_url: r.certificate_url as string,
                                        file_name: r.certificate_name ?? r.title,
                                        title: r.title,
                                      })
                                    }
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                )}
                                {canManage && (
                                  <>
                                    <Button variant="ghost" size="sm" onClick={() => startEdit(r)} title="แก้ไข">
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(r)}
                                      title="ลบ"
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PersonnelTrainingsPage;
