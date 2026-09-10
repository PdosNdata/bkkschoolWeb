import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, Trash2, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Swal from "sweetalert2";
import { supabase } from "@/integrations/supabase/client";
import {
  allowedTeachersTable,
  extractTeachers,
  type AllowedTeacher,
  type ParsedTeacher,
} from "@/lib/allowedTeachers";

const TeacherImportPage = () => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedTeacher[]>([]);
  const [importing, setImporting] = useState(false);

  const [list, setList] = useState<AllowedTeacher[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const listedEmails = useMemo(() => new Set(list.map((t) => t.email)), [list]);

  const fetchList = async () => {
    setLoadingList(true);
    const { data } = await allowedTeachersTable().select("*").order("created_at", { ascending: false });
    setList((data ?? []) as AllowedTeacher[]);
    setLoadingList(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const applyParse = (text: string) => {
    setRawText(text);
    setParsed(extractTeachers(text));
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    applyParse(text);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImport = async () => {
    if (parsed.length === 0) return;
    setImporting(true);
    try {
      const rows = parsed.map((t) => ({ email: t.email, full_name: t.full_name || null }));
      const { error: upsertErr } = await allowedTeachersTable().upsert(rows, { onConflict: "email" });
      if (upsertErr) throw upsertErr;

      // Approve everyone who has already registered — one call.
      // (RPC not in the generated types yet.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: approved, error: approveErr } = await (supabase as any).rpc(
        "approve_teachers_by_email",
        { emails: parsed.map((t) => t.email) },
      );
      if (approveErr) throw approveErr;

      toast({
        title: "นำเข้าสำเร็จ",
        description: `เพิ่มในรายชื่ออนุญาต ${parsed.length} คน · อนุมัติบัญชีที่สมัครไว้แล้ว ${approved ?? 0} คน`,
      });
      setRawText("");
      setParsed([]);
      fetchList();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "กรุณาลองใหม่อีกครั้ง";
      toast({ title: "นำเข้าไม่สำเร็จ", description: message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleRemove = async (email: string) => {
    const res = await Swal.fire({
      title: "ลบออกจากรายชื่ออนุญาต?",
      text: email,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบออก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    });
    if (!res.isConfirmed) return;
    const { error } = await allowedTeachersTable().delete().eq("email", email);
    if (error) {
      toast({ title: "ลบไม่สำเร็จ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "ลบแล้ว", description: "การลบนี้ไม่ถอนสิทธิ์ครูที่เข้าระบบไปแล้ว" });
    fetchList();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">นำเข้าข้อมูลครู</h1>
          <p className="text-muted-foreground mt-1">
            เพิ่มรายชื่ออีเมลครูที่อนุญาตให้เข้าใช้ระบบ — เมื่อครูสมัครด้วยอีเมลในรายชื่อนี้ จะได้สิทธิ์ "ครู" และอนุมัติอัตโนมัติ
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ขั้นตอนจาก Google Form</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>สร้าง Google Form ให้ครูกรอก ชื่อ-นามสกุล และ อีเมล</li>
              <li>ที่แท็บ "การตอบกลับ" กดไอคอนชีต เพื่อเปิดใน Google Sheets</li>
              <li>ใน Sheets: ไฟล์ → ดาวน์โหลด → <b>ค่าที่คั่นด้วยเครื่องหมายจุลภาค (.csv)</b></li>
              <li>อัปโหลดไฟล์ .csv ด้านล่าง (ระบบจะหาคอลัมน์อีเมลให้เอง)</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">อัปโหลด / วางข้อมูล</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={onFile}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                เลือกไฟล์ CSV จาก Google Form
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">หรือวางรายการเอง (อีเมลบรรทัดละคน หรือ "อีเมล, ชื่อ")</div>
            <Textarea
              rows={5}
              value={rawText}
              onChange={(e) => applyParse(e.target.value)}
              placeholder={"somchai@example.com, สมชาย ใจดี\nsuda@example.com"}
            />

            {parsed.length > 0 && (
              <div className="rounded-lg border">
                <div className="px-4 py-2 text-sm border-b bg-muted/40">
                  พบ <b>{parsed.length}</b> อีเมล — ใหม่{" "}
                  {parsed.filter((t) => !listedEmails.has(t.email)).length} · มีในรายชื่อแล้ว{" "}
                  {parsed.filter((t) => listedEmails.has(t.email)).length}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>อีเมล</TableHead>
                        <TableHead>ชื่อ</TableHead>
                        <TableHead className="text-right">สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsed.map((t) => (
                        <TableRow key={t.email}>
                          <TableCell>{t.email}</TableCell>
                          <TableCell>{t.full_name || "-"}</TableCell>
                          <TableCell className="text-right">
                            {listedEmails.has(t.email) ? (
                              <Badge variant="secondary">มีอยู่แล้ว</Badge>
                            ) : (
                              <Badge>ใหม่</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Button onClick={handleImport} disabled={parsed.length === 0 || importing}>
              {importing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังนำเข้า...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> นำเข้า {parsed.length > 0 ? `(${parsed.length})` : ""}</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายชื่อครูที่อนุญาต ({list.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingList ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังโหลด...
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">ยังไม่มีรายชื่อ</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>อีเมล</TableHead>
                      <TableHead>ชื่อ</TableHead>
                      <TableHead className="whitespace-nowrap">เพิ่มเมื่อ</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((t) => (
                      <TableRow key={t.email}>
                        <TableCell>{t.email}</TableCell>
                        <TableCell>{t.full_name || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(t.created_at).toLocaleDateString("th-TH")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(t.email)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
    </div>
  );
};

export default TeacherImportPage;
