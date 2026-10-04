import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, Copy, FileSpreadsheet, Pencil, Plus, Printer, Search, Trash2, Upload, Users } from "lucide-react";
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
import { summarizeByClass, summaryToPrintHtml, summaryToTsv } from "@/lib/studentsSummary";
import {
  CLASS_LEVELS,
  ExamScore,
  Student,
  StudentInput,
  classLabel,
  errMsg,
  fetchAllStudents,
  parseStudentRows,
  readSpreadsheetToText,
  scoresReportTable,
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

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [readingFile, setReadingFile] = useState(false);
  const [fileNote, setFileNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [toDelete, setToDelete] = useState<Student | null>(null);

  const [scoresFor, setScoresFor] = useState<Student | null>(null);
  const [scores, setScores] = useState<ExamScore[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);

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

  const openScores = async (s: Student) => {
    setScoresFor(s);
    setScores([]);
    setScoresLoading(true);
    try {
      await ensureSession();
      const { data, error } = await withTimeout<{ data: ExamScore[] | null; error: { message: string } | null }>(
        scoresReportTable().select("*").eq("student_code", s.student_code).order("taken_at", { ascending: false }),
        20000,
        "ขั้นที่ 2: โหลดคะแนนสอบ",
      );
      if (error) throw error;
      setScores(data ?? []);
    } catch (e) {
      toast({ title: "โหลดคะแนนสอบไม่สำเร็จ", description: errMsg(e), variant: "destructive" });
    } finally {
      setScoresLoading(false);
    }
  };

  const parsed = useMemo(() => parseStudentRows(importText), [importText]);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    setReadingFile(true);
    try {
      const { text, sheet } = await readSpreadsheetToText(file);
      setImportText(text);
      setFileNote(`โหลดจากไฟล์ ${file.name}${sheet ? ` (ชีต "${sheet}")` : ""} — ตรวจรายการด้านล่างก่อนกดนำเข้า`);
    } catch (err) {
      setFileNote("");
      toast({ title: "อ่านไฟล์ไม่สำเร็จ", description: errMsg(err), variant: "destructive" });
    } finally {
      setReadingFile(false);
    }
  };

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

  const summary = useMemo(() => summarizeByClass(students), [students]);

  const copySummary = async () => {
    const tsv = summaryToTsv(summary.rows);
    try {
      await navigator.clipboard.writeText(tsv);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = tsv;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast({ title: "คัดลอกแล้ว", description: "วางลงใน Excel หรือ Google Sheets ได้เลย" });
  };

  const printSummary = () => {
    const w = window.open("", "_blank");
    if (!w) {
      toast({ title: "เบราว์เซอร์บล็อกหน้าต่างพิมพ์", description: "อนุญาตป๊อปอัปสำหรับเว็บนี้ แล้วลองใหม่", variant: "destructive" });
      return;
    }
    const asOf = new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
    w.document.write(summaryToPrintHtml(summary.rows, "โรงเรียนบ้านค้อดอนแคน", asOf));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const half = Math.ceil(filtered.length / 2);

  const renderTable = (list: Student[]) => (
    <div className="overflow-x-auto">
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="h-8">
            <TableHead className="h-8 w-[56px] px-2 sm:w-[72px]">รหัส</TableHead>
            <TableHead className="h-8 px-2">ชื่อ-สกุล</TableHead>
            <TableHead className="hidden h-8 w-[64px] whitespace-nowrap px-2 sm:table-cell">ชั้น/ห้อง</TableHead>
            <TableHead className="h-8 w-[88px] px-0 sm:w-[96px] sm:px-1" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((s) => (
            <TableRow key={s.id} className={s.is_active ? "" : "opacity-60"}>
              <TableCell className="px-2 py-0.5 font-mono text-xs sm:text-sm lg:py-0">{s.student_code}</TableCell>
              <TableCell className="px-2 py-0.5 lg:py-0">
                {studentFullName(s)}
                <span className="ml-1 whitespace-nowrap text-xs text-muted-foreground sm:hidden">{classLabel(s)}</span>
                {!s.is_active && <Badge variant="outline" className="ml-2 px-1.5 py-0 text-[10px]">ไม่ได้ศึกษาแล้ว</Badge>}
              </TableCell>
              <TableCell className="hidden whitespace-nowrap px-2 py-0.5 sm:table-cell lg:py-0">{classLabel(s)}</TableCell>
              <TableCell className="px-0 py-0.5 sm:px-1 lg:py-0">
                <div className="flex justify-end whitespace-nowrap">
                  <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-6 lg:w-6" aria-label="คะแนนสอบ" onClick={() => openScores(s)}><BarChart3 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-6 lg:w-6" aria-label="แก้ไข" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 lg:h-6 lg:w-6" aria-label="ลบ" onClick={() => setToDelete(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" />กลับแดชบอร์ด</Button>
            </Link>
            <h1 className="text-2xl font-bold text-primary">ข้อมูลนักเรียน</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSummaryOpen(true)}><Users className="mr-2 h-4 w-4" />สรุปจำนวนนักเรียน</Button>
            <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-2 h-4 w-4" />นำเข้าจาก Excel</Button>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />เพิ่มนักเรียน</Button>
          </div>
        </div>

        <Card>
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-lg">
              ทะเบียนนักเรียน <span className="text-sm font-normal text-muted-foreground">({filtered.length} / {students.length} คน)</span>
            </CardTitle>
            <div className="mt-2 flex flex-wrap gap-3">
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
          <CardContent className="px-3 pb-3 pt-0">
            {loading ? (
              <p className="py-8 text-center text-muted-foreground">กำลังโหลด…</p>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                {students.length === 0 ? "ยังไม่มีรายชื่อนักเรียน — กด \"นำเข้าจาก Excel\" หรือ \"เพิ่มนักเรียน\"" : "ไม่พบรายชื่อที่ตรงกับการค้นหา"}
              </p>
            ) : (
              <>
                {/* phones/tablets: one list */}
                <div className="lg:hidden">{renderTable(filtered)}</div>
                {/* wide screens: split in two columns so a whole class fits on one screen */}
                <div className="hidden gap-4 lg:grid lg:grid-cols-2">
                  {renderTable(filtered.slice(0, half))}
                  {filtered.length > half && renderTable(filtered.slice(half))}
                </div>
              </>
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

      {/* head-count by class */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>สรุปจำนวนนักเรียน</DialogTitle>
            <DialogDescription>แยกตามชั้น ชาย หญิง รวม (นับเฉพาะนักเรียนที่กำลังศึกษา)</DialogDescription>
          </DialogHeader>
          <Table className="text-sm sm:text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="px-2 sm:px-4">ชั้น</TableHead>
                <TableHead className="px-2 text-right sm:px-4">หญิง</TableHead>
                <TableHead className="px-2 text-right sm:px-4">ชาย</TableHead>
                <TableHead className="px-2 text-right sm:px-4">รวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.rows.map((r) => (
                <TableRow
                  key={r.label}
                  className={r.kind === "grand" ? "bg-muted font-bold" : r.kind === "subtotal" ? "bg-muted/50 font-semibold" : ""}
                >
                  <TableCell className="whitespace-nowrap px-2 py-1.5 sm:px-4">{r.label}</TableCell>
                  <TableCell className="px-2 py-1.5 text-right sm:px-4">{r.female}</TableCell>
                  <TableCell className="px-2 py-1.5 text-right sm:px-4">{r.male}</TableCell>
                  <TableCell className="px-2 py-1.5 text-right sm:px-4">{r.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(summary.noGender > 0 || summary.otherClass > 0) && (
            <div className="space-y-1 text-sm text-amber-700">
              {summary.noGender > 0 && <p>มี {summary.noGender} คนที่ไม่มีข้อมูลเพศ — นับในช่อง "รวม" เท่านั้น (แก้ไขเพศได้ในหน้ารายชื่อ)</p>}
              {summary.otherClass > 0 && <p>มี {summary.otherClass} คนที่ชั้นไม่อยู่ในตาราง (ป.1–ม.3) — ไม่ถูกนับ</p>}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={copySummary}><Copy className="mr-2 h-4 w-4" />คัดลอกไป Excel</Button>
            <Button variant="outline" onClick={printSummary}><Printer className="mr-2 h-4 w-4" />พิมพ์</Button>
            <Button onClick={() => setSummaryOpen(false)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* import */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>นำเข้ารายชื่อจาก Excel</DialogTitle>
            <DialogDescription>
              เลือกไฟล์ Excel (.xlsx, .xls) หรือ CSV หรือคัดลอกตารางมาวางด้านล่าง ถ้ามีแถวหัวตาราง (เช่น รหัสนักเรียน, ชื่อ-สกุล, ชั้น, ห้อง, เพศ)
              ระบบจับคู่คอลัมน์ให้ ไม่ต้องเรียงลำดับ · ถ้าไม่มีหัวตาราง ให้เรียง: <b>รหัสนักเรียน, คำนำหน้า, ชื่อ, นามสกุล, เพศ (ช/ญ), ชั้น, ห้อง</b>
              — รหัสที่มีอยู่แล้วจะถูกอัปเดต ไม่เพิ่มซ้ำ
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-3">
            <input ref={fileRef} type="file" className="hidden" accept=".xlsx,.xls,.xlsb,.csv,.tsv,.txt" onChange={onPickFile} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={readingFile}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />{readingFile ? "กำลังอ่านไฟล์…" : "เลือกไฟล์ Excel / CSV"}
            </Button>
            {fileNote && <span className="text-sm text-muted-foreground">{fileNote}</span>}
          </div>
          <Textarea rows={10} className="font-mono text-xs" value={importText} onChange={(e) => setImportText(e.target.value)}
            placeholder={"64019\tเด็กชาย\tสมชาย\tใจดี\tช\tม.1\t1\n64020\tเด็กหญิง\tสมหญิง\tรักเรียน\tญ\tม.1\t1"} />
          {importText.trim() && (
            <div className="space-y-1 text-sm">
              <p className="text-green-700">อ่านได้ {parsed.rows.length} คน{parsed.usedHeader && " (จับคู่คอลัมน์จากหัวตาราง)"}{parsed.rows.length > 0 && ` (ชั้น: ${[...new Set(parsed.rows.map((r) => r.class_level))].join(", ")})`}</p>
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

      {/* exam scores of one student */}
      <Dialog open={!!scoresFor} onOpenChange={(o) => !o && setScoresFor(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>คะแนนสอบ — {scoresFor && `${scoresFor.student_code} ${studentFullName(scoresFor)}`}</DialogTitle>
            <DialogDescription>ผลจากระบบตรวจคำตอบปรนัย แสดงเฉพาะผลที่คุณเป็นผู้ตรวจเอง</DialogDescription>
          </DialogHeader>
          {scoresLoading ? (
            <p className="py-6 text-center text-muted-foreground">กำลังโหลด…</p>
          ) : scores.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">ยังไม่มีผลสอบของนักเรียนคนนี้</p>
          ) : (
            <div className="max-h-[50vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>วิชา</TableHead>
                    <TableHead>การสอบ</TableHead>
                    <TableHead>ภาคเรียน</TableHead>
                    <TableHead className="text-right">คะแนน</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.taken_at).toLocaleDateString("th-TH")}</TableCell>
                      <TableCell>{r.subject_name}</TableCell>
                      <TableCell>{[r.exam_kind, r.exam_name].filter(Boolean).join(" · ") || "-"}</TableCell>
                      <TableCell>{r.semester && r.academic_year ? `${r.semester}/${r.academic_year}` : "-"}</TableCell>
                      <TableCell className="text-right">{r.score}/{r.total}</TableCell>
                      <TableCell className="text-right">{r.percent ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setScoresFor(null)}>ปิด</Button>
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
