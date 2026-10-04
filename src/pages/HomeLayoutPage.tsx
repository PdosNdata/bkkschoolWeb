import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowLeft, ArrowUp, Eye, EyeOff, GripVertical, Loader2, RotateCcw, Save, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { withTimeout } from "@/lib/utils";
import { cacheLayout, homeLayoutTable } from "@/lib/homeLayout";
import { DEFAULT_LAYOUT, HOME_SECTIONS, normalizeLayout, type LayoutEntry } from "@/components/home/homeSections";

const labelOf = (key: string) => HOME_SECTIONS.find((s) => s.key === key);

const same = (a: LayoutEntry[], b: LayoutEntry[]) =>
  a.length === b.length && a.every((e, i) => e.key === b[i].key && e.visible === b[i].visible);

const HomeLayoutPage = () => {
  const { toast } = useToast();
  const [saved, setSaved] = useState<LayoutEntry[]>(DEFAULT_LAYOUT);
  const [layout, setLayout] = useState<LayoutEntry[]>(DEFAULT_LAYOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("approved", true);
        setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
      } else {
        setIsAdmin(false);
      }
      const { data } = await homeLayoutTable().select("sections").eq("id", "main").maybeSingle();
      const current = normalizeLayout(data?.sections);
      setSaved(current);
      setLayout(current);
      setLoading(false);
    })();
  }, []);

  const dirty = !same(layout, saved);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= layout.length || from === to) return;
    const next = [...layout];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setLayout(next);
    // keep the moved row in view / focused for keyboard users
    requestAnimationFrame(() => rowRefs.current[item.key]?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  };

  const toggle = (key: string) =>
    setLayout((prev) => prev.map((e) => (e.key === key ? { ...e, visible: !e.visible } : e)));

  const onDrop = (targetKey: string) => {
    if (!dragKey || dragKey === targetKey) return;
    move(layout.findIndex((e) => e.key === dragKey), layout.findIndex((e) => e.key === targetKey));
  };

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await withTimeout(
        homeLayoutTable().upsert({ id: "main", sections: layout, updated_at: new Date().toISOString() }) as Promise<{ error: Error | null }>,
        20000,
        "บันทึกการจัดวาง",
      );
      if (error) throw error;
      setSaved(layout);
      cacheLayout(layout);
      toast({ title: "บันทึกการจัดวางหน้าหลักแล้ว", description: "เปิดหน้าหลักเพื่อดูผล (ผู้เข้าชมเห็นตามนี้ทันที)" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "กรุณาลองใหม่อีกครั้ง";
      toast({ title: "บันทึกไม่สำเร็จ", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const visibleCount = layout.filter((e) => e.visible).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-primary">จัดวางหน้าหลัก</h1>
            <p className="text-muted-foreground">ลากบล็อกเพื่อสลับตำแหน่ง หรือใช้ลูกศร ▲▼ · กดรูปตาเพื่อซ่อน/แสดง</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />กลับแดชบอร์ด</Link>
          </Button>
        </div>

        {loading || isAdmin === null ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังโหลด...
          </div>
        ) : !isAdmin ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">เฉพาะแอดมินเท่านั้นที่จัดวางหน้าหลักได้</CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>ลำดับบล็อกในหน้าหลัก</CardTitle>
              <CardDescription>
                แถบเมนูด้านบนและส่วนท้ายเว็บอยู่ตำแหน่งเดิมเสมอ · แสดงอยู่ {visibleCount} จาก {layout.length} บล็อก
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-2">
                {layout.map((entry, index) => {
                  const def = labelOf(entry.key);
                  const isOver = overKey === entry.key && dragKey && dragKey !== entry.key;
                  return (
                    <li
                      key={entry.key}
                      ref={(el) => { rowRefs.current[entry.key] = el; }}
                      draggable
                      onDragStart={(e) => { setDragKey(entry.key); e.dataTransfer.effectAllowed = "move"; }}
                      onDragOver={(e) => { e.preventDefault(); setOverKey(entry.key); }}
                      onDrop={(e) => { e.preventDefault(); onDrop(entry.key); setDragKey(null); setOverKey(null); }}
                      onDragEnd={() => { setDragKey(null); setOverKey(null); }}
                      className={`flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm transition-all ${
                        entry.visible ? "" : "opacity-60"
                      } ${dragKey === entry.key ? "opacity-40" : ""} ${isOver ? "border-purple-500 ring-2 ring-purple-300" : ""}`}
                    >
                      <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-slate-400" aria-hidden />
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight">{def?.label ?? entry.key}</p>
                        <p className="text-xs text-muted-foreground">{def?.description}</p>
                      </div>
                      {!entry.visible && (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">ซ่อนอยู่</span>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => move(index, index - 1)} disabled={index === 0} title="ขึ้น" aria-label={`ย้าย ${def?.label} ขึ้น`}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => move(index, index + 1)} disabled={index === layout.length - 1} title="ลง" aria-label={`ย้าย ${def?.label} ลง`}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggle(entry.key)} title={entry.visible ? "ซ่อนบล็อกนี้" : "แสดงบล็อกนี้"} aria-label={entry.visible ? "ซ่อน" : "แสดง"}>
                        {entry.visible ? <Eye className="h-4 w-4 text-purple-600" /> : <EyeOff className="h-4 w-4 text-slate-500" />}
                      </Button>
                    </li>
                  );
                })}
              </ol>

              <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                <Button onClick={save} disabled={saving || !dirty} className="bg-purple-600 text-white hover:bg-purple-700">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? "กำลังบันทึก..." : "บันทึกการจัดวาง"}
                </Button>
                <Button variant="outline" onClick={() => setLayout(DEFAULT_LAYOUT)} disabled={same(layout, DEFAULT_LAYOUT)}>
                  <RotateCcw className="mr-2 h-4 w-4" /> กลับเป็นค่าเริ่มต้น
                </Button>
                <Button asChild variant="ghost" className="ml-auto">
                  <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />เปิดหน้าหลัก</a>
                </Button>
                {dirty && <span className="w-full text-sm font-medium text-amber-700">มีการเปลี่ยนแปลงที่ยังไม่บันทึก</span>}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomeLayoutPage;
