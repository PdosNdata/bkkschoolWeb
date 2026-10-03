import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/lib/utils";
import {
  CLASS_LEVELS,
  Student,
  StudentInput,
  classLabel,
  errMsg,
  fetchAllStudents,
  parseStudentRows,
  studentFullName,
  studentsTable,
} from "@/lib/students";

const emptyForm = {
  student_code: "",
  prefix: "",
  first_name: "",
  last_name: "",
  gender: "" as "" | "ช" | "ญ",
  class_level: "ป.1",
  room: "",
  is_active: true,
};
type FormState = typeof emptyForm;

const StudentsPage = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  const [editing, setEditing] = useState<Student | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  const [toDelete, setToDelete] = useState<Student | null>(null);

  // The server sometimes stores a row but the browser never gets the reply
  // (same issue as the trainings page). Writes below are idempotent, and on a
  // timeout we reload the list and tell the user it may already be saved.
  const isTimeout = (e: unknown) => errMsg(e).includes("ใช้เวลานานเกินไป");
  const pendingId = useRef<string | null>(null);
  const timeoutToast = (e: unknown) =>
    toast({
      title: "ไม่ได้รับการตอบกลับจากเซิร์ฟเวอร์",
      description: `${errMsg(e)} — ข้อมูลอาจถูกบันทึกไปแล้ว ตรวจดูในตารางก่อน (กดบันทึกหรือนำเข้าซ้ำได้ ไม่ทำให้ซ้ำ)`,
      variant: "destructive",
    });
  // Step 1 of every write: make sure the login session is usable. A stalled
  // token refresh would otherwise hold back the write itself, so label it.
  const ensureSession = async () => {
    const {
      data: { session },
    } = await withTimeout(supabase.auth.getSession(), 10000, "ขั้นที่ 1: ตรวจสอบการเข้าสู่ระบบ");
    if (!session) throw new Error("หมดเวลาเข้าสู่ระบบ กรุณาล็อกอินใหม่");
  };

  const load = async () => {
    try {
      setStudents(await withTimeout(fetchAllStudents(), 30000, "โหลดรายชื่อนักเรียน"));
    } catch (e) {
      console.error("Error loading students:", e);
      toast({ title: "โหลดรายชื่อนักเรียนไม่สำเร็จ", description: errMsg(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("approved", true);
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (classFilter !== "all" && s.class_level !== classFilter) return false;
      if (!q) return true;
      return s.student_code.toLowerCase().includes(q) || studentFullName(s).toLowerCase().includes(q);
    });
  }, [students, search, classFilter]);

  const openNew = () => {
    pendingId.current = null;
    setForm({ ...emptyForm, class_level: classFilter !== "all" ? classFilter : "ป.1" });
    setEditing("new");
  };
  const openEdit = (s: Student) => {
    setForm({
      student_code: s.student_code,
      prefix: s.prefix ?? "",
      first_name: s.first_name,
      last_name: s.last_name ?? "",
      gender: s.gender ?? "",
      class_level: s.class_level,
      room: s.room ?? "",
      is_active: s.is_active,
    });
    setEditing(s);
  };

  const save = async () => {
    const code = form.student_code.trim();
    if (!code || !form.first_name.trim()) {
      toast({ title: "กรอกรหัสนักเรียนและชื่อให้ครบ", variant: "destructive" });
      return;
    }
    const payload = {
      student_code: code,
      prefix: form.prefix.trim() || null,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      gender: form.gender || null,
      class_level: form.class_level,
      room: form.room.trim() || null,
      is_active: form.is_active,
    };
    setSaving(true);
    try {
      await ensureSession();
      const res = await withTimeout<{ error: { code?: string; message: string } | null }>(
        editing === "new"
          ? studentsTable().upsert({ ...payload, id: (pendingId.current ??= crypto.randomUUID()) }, { onConflict: "id" })
          : studentsTable().update(payload).eq("id", (editing as Student).id),
        15000,
        "ขั้นที่ 2: บันทึกข้อมูลนักเรียน",
      );
      if (res.error) {
        if (res.error.code === "23505") throw new Error(`รหัสนักเรียน ${code} มีอยู่ในระบบแล้ว`);
        throw res.error;
      }
      toast({ title: "บันทึกแล้ว" });
      setEditing(null);
      await load();
    } catch (e) {
      if (isTimeout(e)) {
        timeoutToast(e);
        load();
      } else {
        toast({ title: "บันทึกไม่สำเร็จ", description: errMsg(e), variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await ensureSession();
      const { error } = await withTimeout<{ error: { message: string } | null }>(
        studentsTable().delete().eq("id", toDelete.id),
        15000,
        "ขั้นที่ 2: ลบนักเรียน",
      );
      if (error) throw error;
      toast({ title: "ลบแล้ว" });
    } catch (e) {
      if (isTimeout(e)) timeoutToast(e);
      else toast({ title: "ลบไม่สำเร็จ", description: errMsg(e), variant: "destructive" });
    }
    setToDelete(null);
    await load();
  };

  const parsed = useMemo(() => parseStudentRows(importText), [importText]);

  const runImport = async () => {
    if (!parsed.rows.length) return;
    setImporting(true);
    try {
      await ensureSession();
      for (let i = 0; i < parsed.rows.length; i += 200) {
        const chunk: StudentInput[] = parsed.rows.slice(i, i + 200);
        const { error } = await withTimeout<{ error: { message: string } | null }>(
          studentsTable().upsert(chunk, { onConflict: "student_code" }),
          20000,
          "ขั้นที่ 2: นำเข้ารายชื่อ",
        );
        if (error) throw error;
      }
      toast({ title: `นำเข้าแล้ว ${parsed.rows.length} คน`, description: "รหัสที่มีอยู่แล้วถูกอัปเดตข้อมูล" });
      setImportOpen(false);
      setImportText("");
      await load();
    } catch (e) {
      if (isTimeout(e)) {
        timeoutToast(e);
        load();
      } else {
        toast({ title: "นำเข้าไม่สำเร็จ", description: errMsg(e), variant: "destructive" });
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" />กลับ</Button>
            </Link>
            <h1 className="text-3xl font-bold text-primary">ข้อมูลนักเรียน</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-2 h-4 w-4" />นำเข้าจาก Excel</Button>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />เพิ่มนักเรียน</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              ทะเบียนนักเรียน <span className="text-sm font-normal text-muted-foreground">({filtered.length} / {students.length} คน)</span>
            </CardTitle>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="ค้นหาด้วยรหัสหรือชื่อ" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="ทุกชั้น" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกชั้น</SelectItem>
                  {CLASS_LEVELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-muted-foreground">กำลังโหลด…</p>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                {students.length === 0 ? "ยังไม่มีรายชื่อนักเรียน — กด \"นำเข้าจาก Excel\" หรือ \"เพิ่มนักเรียน\"" : "ไม่พบรายชื่อที่ตรงกับการค้นหา"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัส</TableHead>
                      <TableHead>ชื่อ-สกุล</TableHead>
                      <TableHead>ชั้น/ห้อง</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead className="w-[110px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => (
                      <TableRow key={s.id} className={s.is_active ? "" : "opacity-60"}>
                        <TableCell className="font-mono">{s.student_code}</TableCell>
                        <TableCell>{studentFullName(s)}</TableCell>
                        <TableCell>{classLabel(s)}</TableCell>
                        <TableCell>{s.is_active ? <Badge variant="secondary">กำลังศึกษา</Badge> : <Badge variant="outline">ไม่ได้ศึกษาแล้ว</Badge>}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" aria-label="แก้ไข" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                          {isAdmin && (
                            <Button variant="ghost" size="icon" aria-label="ลบ" onClick={() => setToDelete(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />

      {/* add / edit */}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "เพิ่มนักเรียน" : "แก้ไขข้อมูลนักเรียน"}</DialogTitle>
            <DialogDescription>รหัสนักเรียนใช้เป็นตัวเชื่อมกับระบบอื่น เช่น ระบบตรวจคำตอบปรนัย</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1"><Label>รหัสนักเรียน *</Label>
              <Input value={form.student_code} onChange={(e) => setForm({ ...form, student_code: e.target.value })} inputMode="numeric" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1"><Label>คำนำหน้า</Label>
                <Input value={form.prefix} placeholder="เด็กชาย" onChange={(e) => setForm({ ...form, prefix: e.target.value })} /></div>
              <div className="grid gap-1"><Label>ชื่อ *</Label>
                <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
              <div className="grid gap-1"><Label>นามสกุล</Label>
                <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1"><Label>ชั้น *</Label>
                <Select value={form.class_level} onValueChange={(v) => setForm({ ...form, class_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CLASS_LEVELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select></div>
              <div className="grid gap-1"><Label>ห้อง</Label>
                <Input value={form.room} placeholder="1" onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
              <div className="grid gap-1"><Label>เพศ</Label>
                <Select value={form.gender || "none"} onValueChange={(v) => setForm({ ...form, gender: v === "none" ? "" : (v as "ช" | "ญ") })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่ระบุ</SelectItem>
                    <SelectItem value="ช">ชาย</SelectItem>
                    <SelectItem value="ญ">หญิง</SelectItem>
                  </SelectContent>
                </Select></div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c === true })} />
              กำลังศึกษาอยู่ (เอาออกถ้าย้ายหรือจบแล้ว)
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>ยกเลิก</Button>
            <Button onClick={save} disabled={saving}>{saving ? "กำลังบันทึก…" : "บันทึก"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* import */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>นำเข้ารายชื่อจาก Excel</DialogTitle>
            <DialogDescription>
              คัดลอกตารางจาก Excel มาวาง โดยเรียงคอลัมน์: <b>รหัสนักเรียน, คำนำหน้า, ชื่อ, นามสกุล, เพศ (ช/ญ), ชั้น (เช่น ม.1), ห้อง</b>
              — รหัสที่มีอยู่แล้วจะถูกอัปเดต ไม่เพิ่มซ้ำ
            </DialogDescription>
          </DialogHeader>
          <Textarea rows={10} className="font-mono text-xs" value={importText} onChange={(e) => setImportText(e.target.value)}
            placeholder={"64019\tเด็กชาย\tสมชาย\tใจดี\tช\tม.1\t1\n64020\tเด็กหญิง\tสมหญิง\tรักเรียน\tญ\tม.1\t1"} />
          {importText.trim() && (
            <div className="space-y-1 text-sm">
              <p className="text-green-700">อ่านได้ {parsed.rows.length} คน{parsed.rows.length > 0 && ` (ชั้น: ${[...new Set(parsed.rows.map((r) => r.class_level))].join(", ")})`}</p>
              {parsed.errors.length > 0 && (
                <ul className="max-h-24 list-disc overflow-y-auto pl-5 text-destructive">
                  {parsed.errors.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}
                  {parsed.errors.length > 20 && <li>…และอีก {parsed.errors.length - 20} รายการ</li>}
                </ul>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>ยกเลิก</Button>
            <Button onClick={runImport} disabled={importing || parsed.rows.length === 0}>
              {importing ? "กำลังนำเข้า…" : `นำเข้า ${parsed.rows.length} คน`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบนักเรียน?</AlertDialogTitle>
            <AlertDialogDescription>
              ลบ {toDelete && `${toDelete.student_code} ${studentFullName(toDelete)}`} ออกจากทะเบียนถาวร
              ถ้าแค่ย้ายหรือจบแล้ว แนะนำให้แก้ไขแล้วเอาเครื่องหมาย "กำลังศึกษาอยู่" ออกแทน
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentsPage;
