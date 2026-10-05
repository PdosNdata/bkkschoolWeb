import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Loader2, RotateCcw, Save, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { withTimeout } from "@/lib/utils";
import {
  CARD_STYLE_GROUPS,
  DEFAULT_CARD_STYLES,
  cacheCardStyles,
  cardParts,
  cardStylesTable,
  normalizeCardStyles,
  type CardStyle,
} from "@/lib/cardStyles";

type Styles = Record<string, CardStyle>;

const same = (a: Styles, b: Styles) => JSON.stringify(a) === JSON.stringify(b);

const Slider = ({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) => (
  <label className="block text-xs font-medium text-slate-600">
    <span className="flex justify-between">
      <span>{label}</span>
      <span className="tabular-nums text-slate-900">{value}{unit}</span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="mt-1 w-full accent-purple-600"
    />
  </label>
);

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="flex flex-col items-center gap-1 text-xs font-medium text-slate-600">
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-14 cursor-pointer rounded-md border border-slate-300 bg-white p-0.5"
    />
    {label}
  </label>
);

const Preview = ({ s }: { s: CardStyle }) => {
  const t = cardParts(s);
  return (
    <div className="rounded-2xl" style={t.outer}>
      <div className="flex flex-col overflow-hidden" style={t.inner}>
        <div className="flex h-16 items-center px-3" style={t.fallback}>
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow" style={t.btn}>ป้ายหมวด</span>
        </div>
        <div className="p-3">
          <p className="mb-1 text-sm font-bold" style={t.titleStyle}>ชื่อเรื่องตัวอย่าง</p>
          <p className="mb-2 text-xs text-gray-600">คำอธิบายสั้น ๆ ของการ์ด</p>
          <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white shadow" style={t.btn}>อ่านต่อ →</span>
        </div>
      </div>
    </div>
  );
};

const CardStylesPage = () => {
  const { toast } = useToast();
  const [saved, setSaved] = useState<Styles>(normalizeCardStyles({}));
  const [styles, setStyles] = useState<Styles>(normalizeCardStyles({}));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("approved", true);
        setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
      } else {
        setIsAdmin(false);
      }
      const { data } = await cardStylesTable().select("styles").eq("id", "main").maybeSingle();
      const current = normalizeCardStyles(data?.styles);
      setSaved(current);
      setStyles(current);
      setLoading(false);
    })();
  }, []);

  const dirty = !same(styles, saved);
  const patch = (key: string, p: Partial<CardStyle>) => setStyles((prev) => ({ ...prev, [key]: { ...prev[key], ...p } }));

  const applyToGroup = (groupId: string, fromKey: string) => {
    const group = CARD_STYLE_GROUPS.find((g) => g.id === groupId);
    if (!group) return;
    setStyles((prev) => {
      const next = { ...prev };
      group.entries.forEach((e) => { next[e.key] = { ...prev[fromKey] }; });
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await withTimeout(
        cardStylesTable().upsert({ id: "main", styles, updated_at: new Date().toISOString() }) as Promise<{ error: Error | null }>,
        20000,
        "บันทึกสไตล์การ์ด",
      );
      if (error) throw error;
      setSaved(styles);
      cacheCardStyles(styles);
      toast({ title: "บันทึกสไตล์การ์ดแล้ว", description: "เปิดหน้าหลักเพื่อดูผล (ผู้เข้าชมเห็นตามนี้ทันที)" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "กรุณาลองใหม่อีกครั้ง";
      toast({ title: "บันทึกไม่สำเร็จ", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-primary">ปรับสไตล์การ์ด</h1>
            <p className="text-muted-foreground">เลือกสี การไล่ระดับสี ความหนากรอบ และเงาของการ์ดบนหน้าหลัก</p>
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
          <Card><CardContent className="py-12 text-center text-muted-foreground">เฉพาะแอดมินเท่านั้นที่ปรับสไตล์การ์ดได้</CardContent></Card>
        ) : (
          <div className="space-y-6">
            <div className="sticky top-16 z-20 flex flex-wrap items-center gap-3 rounded-xl border bg-white/90 p-3 shadow-md backdrop-blur">
              <Button onClick={save} disabled={saving || !dirty} className="bg-purple-600 text-white hover:bg-purple-700">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {saving ? "กำลังบันทึก..." : "บันทึกสไตล์การ์ด"}
              </Button>
              <Button variant="outline" onClick={() => setStyles(normalizeCardStyles({}))} disabled={same(styles, normalizeCardStyles({}))}>
                <RotateCcw className="mr-2 h-4 w-4" /> คืนค่าเริ่มต้นทั้งหมด
              </Button>
              {dirty && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">มีการเปลี่ยนแปลงที่ยังไม่บันทึก</span>}
              <Button asChild variant="ghost" className="ml-auto">
                <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />เปิดหน้าหลัก</a>
              </Button>
            </div>

            {CARD_STYLE_GROUPS.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{group.label}</CardTitle>
                  <CardDescription>ตัวอย่างด้านซ้ายเปลี่ยนตามที่ปรับทันที</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 md:grid-cols-2">
                  {group.entries.map((entry) => {
                    const s = styles[entry.key];
                    return (
                      <div key={entry.key} className="grid gap-4 rounded-xl border bg-slate-50/60 p-4 sm:grid-cols-[10rem_1fr]">
                        <div>
                          <p className="mb-2 text-sm font-semibold">{entry.label}</p>
                          <Preview s={s} />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between gap-2">
                            <ColorField label="สีที่ 1" value={s.c1} onChange={(v) => patch(entry.key, { c1: v })} />
                            <ColorField label="สีที่ 2" value={s.c2} onChange={(v) => patch(entry.key, { c2: v })} />
                            <ColorField label="สีที่ 3" value={s.c3} onChange={(v) => patch(entry.key, { c3: v })} />
                          </div>
                          <Slider label="ทิศทางไล่สี" value={s.angle} min={0} max={360} unit="°" onChange={(v) => patch(entry.key, { angle: v })} />
                          <Slider label="ความหนากรอบ" value={s.border} min={0} max={12} unit="px" onChange={(v) => patch(entry.key, { border: v })} />
                          <Slider label="ความฟุ้งของเงา" value={s.shadowBlur} min={0} max={80} unit="px" onChange={(v) => patch(entry.key, { shadowBlur: v })} />
                          <Slider label="ความเข้มของเงา" value={s.shadowOpacity} min={0} max={100} unit="%" onChange={(v) => patch(entry.key, { shadowOpacity: v })} />
                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button type="button" size="sm" variant="outline" onClick={() => applyToGroup(group.id, entry.key)}>
                              <Copy className="mr-1.5 h-3.5 w-3.5" /> ใช้กับทั้งกลุ่ม
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => patch(entry.key, DEFAULT_CARD_STYLES[entry.key])}>
                              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> ค่าเริ่มต้น
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CardStylesPage;
