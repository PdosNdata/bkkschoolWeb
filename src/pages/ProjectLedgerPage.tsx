import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import Swal from "sweetalert2";
import { Download, Mic, MicOff, Save, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  GENERAL_QUICK, LEDGER_PROJECTS, UNITS, ledgerCsv, money, monthOfNow, parseVoice, projectOf, summarize, thaiDate, thaiMonth, todayIso,
  type LedgerEntry, type LedgerKind,
} from "@/lib/projectLedger";

// ตารางนี้ยังไม่อยู่ใน types ที่สร้างอัตโนมัติ — ใช้ any เหมือนหน้าอื่นที่เรียกตารางใหม่
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => (supabase as any).from("project_ledger");

/** สีประจำโครงการ (เขียนเป็นข้อความตรง ๆ เพื่อให้ Tailwind เก็บ class ไว้) */
const HUE: Record<string, { idle: string; on: string }> = {
  sky: { idle: "border-sky-200 bg-sky-50 text-sky-900", on: "border-sky-600 bg-sky-600 text-white" },
  emerald: { idle: "border-emerald-200 bg-emerald-50 text-emerald-900", on: "border-emerald-600 bg-emerald-600 text-white" },
  amber: { idle: "border-amber-200 bg-amber-50 text-amber-900", on: "border-amber-600 bg-amber-600 text-white" },
  stone: { idle: "border-stone-300 bg-stone-100 text-stone-900", on: "border-stone-700 bg-stone-700 text-white" },
  green: { idle: "border-green-200 bg-green-50 text-green-900", on: "border-green-600 bg-green-600 text-white" },
  lime: { idle: "border-lime-300 bg-lime-50 text-lime-900", on: "border-lime-600 bg-lime-600 text-white" },
  teal: { idle: "border-teal-200 bg-teal-50 text-teal-900", on: "border-teal-600 bg-teal-600 text-white" },
  pink: { idle: "border-pink-200 bg-pink-50 text-pink-900", on: "border-pink-600 bg-pink-600 text-white" },
  violet: { idle: "border-violet-200 bg-violet-50 text-violet-900", on: "border-violet-600 bg-violet-600 text-white" },
  orange: { idle: "border-orange-200 bg-orange-50 text-orange-900", on: "border-orange-600 bg-orange-600 text-white" },
};
const hueOf = (key: string) => HUE[projectOf(key)?.hue ?? "stone"];

/* ───────── ไมค์ (Web Speech API) ───────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechCtor: any = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : undefined;
const speechSupported = !!SpeechCtor;

/** ปุ่มไมค์: กดแล้วพูด ได้ข้อความเมื่อพูดจบ (th-TH) · กดซ้ำเพื่อหยุด */
function MicButton({ onText, onInterim, label = "พูด", className = "", activeId, setActiveId, id }: {
  onText: (t: string) => void; onInterim?: (t: string) => void; label?: string; className?: string; id: string; activeId: string; setActiveId: Dispatch<SetStateAction<string>>;
}) {
  const recRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  const listening = activeId === id;
  const { toast } = useToast();

  useEffect(() => () => recRef.current?.abort(), []);
  useEffect(() => { if (!listening) recRef.current?.stop(); }, [listening]);

  const start = () => {
    if (!SpeechCtor) return toast({ title: "เครื่องนี้ไม่รองรับไมค์ในเบราว์เซอร์", description: "ใช้ปุ่มไมค์บนแป้นพิมพ์มือถือแทนได้ (แตะช่องพิมพ์แล้วกดไมค์บนแป้นพิมพ์)", variant: "destructive" });
    if (listening) return setActiveId("");
    const rec = new SpeechCtor();
    rec.lang = "th-TH";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript;
      }
      onInterim?.((finalText + interim).trim());
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      const code = String(e?.error ?? "");
      if (code === "not-allowed" || code === "service-not-allowed") toast({ title: "ยังไม่ได้อนุญาตให้ใช้ไมค์", description: "กดอนุญาตไมโครโฟนที่แถบที่อยู่เว็บ แล้วลองใหม่", variant: "destructive" });
      else if (code === "no-speech") toast({ title: "ไม่ได้ยินเสียง ลองพูดอีกครั้ง" });
      else if (code !== "aborted") toast({ title: "ไมค์ใช้งานไม่ได้ชั่วคราว", description: code, variant: "destructive" });
    };
    rec.onend = () => {
      setActiveId((cur) => (cur === id ? "" : cur)); // ไม่ล้างสถานะของปุ่มอื่นที่เพิ่งเริ่มฟัง
      onInterim?.("");
      if (finalText.trim()) onText(finalText.trim());
    };
    recRef.current = rec;
    setActiveId(id);
    try { rec.start(); } catch { setActiveId((cur) => (cur === id ? "" : cur)); }
  };

  return (
    <button type="button" onClick={start} aria-label={listening ? "หยุดฟัง" : "พูดเพื่อกรอก"}
      className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-full font-semibold transition active:scale-95 ${listening ? "animate-pulse bg-red-600 text-white" : "bg-primary/10 text-primary hover:bg-primary/20"} ${className}`}>
      {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      {label && <span>{listening ? "กำลังฟัง…" : label}</span>}
    </button>
  );
}

type Tab = "add" | "list" | "sum";
interface Form { date: string; project: string; kind: LedgerKind; item: string; qty: string; unit: string; amount: string; note: string }
const blankForm = (project = "", kind: LedgerKind = "expense", date = todayIso()): Form => ({ date, project, kind, item: "", qty: "", unit: "", amount: "", note: "" });

const ProjectLedgerPage = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("add");
  const [form, setForm] = useState<Form>(blankForm());
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [month, setMonth] = useState(monthOfNow());
  const [filterProject, setFilterProject] = useState("");
  const [micActive, setMicActive] = useState("");
  const [heard, setHeard] = useState("");
  const [interim, setInterim] = useState("");
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const all: LedgerEntry[] = [];
      for (let from = 0; from < 10000; from += 1000) {
        const { data, error } = await db().select("*").order("entry_date", { ascending: false }).order("created_at", { ascending: false }).range(from, from + 999);
        if (error) throw error;
        all.push(...(data as LedgerEntry[]));
        if (!data || data.length < 1000) break;
      }
      setEntries(all);
    } catch (e) {
      const err = e as { code?: string; message?: string };
      setLoadError(
        err.code === "PGRST205" || err.code === "42P01" ? "ยังไม่มีตาราง project_ledger — ผู้ดูแลต้องรัน SQL ก่อน (ไฟล์ supabase/migrations/20261101100000_project_ledger.sql)"
        : err.code === "42501" ? "ไม่มีสิทธิ์ใช้เมนูนี้ — ติดต่อผู้ดูแลระบบให้เปิดสิทธิ์ \"บัญชีโครงการด้วยรัก\" ที่หน้า \"จัดการสิทธิ์เมนู\""
        : `โหลดข้อมูลไม่สำเร็จ: ${err.message ?? e}`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? "");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = await (supabase as any).rpc("is_admin");
      setIsAdmin(r?.data === true);
    })();
    void load();
  }, [load]);

  /** ใส่ผลจากการพูดทั้งประโยคลงฟอร์ม (ช่องที่ฟังไม่พบคงค่าเดิม) */
  const applyVoice = (text: string) => {
    setHeard(text);
    const p = parseVoice(text);
    setForm((f) => ({
      ...f,
      project: p.project ?? f.project,
      kind: p.kind ?? f.kind,
      item: p.item ?? f.item,
      qty: p.qty != null ? String(p.qty) : f.qty,
      unit: p.unit ?? f.unit,
      amount: p.amount != null ? String(p.amount) : f.amount,
    }));
    const got = [p.project && "โครงการ", p.kind && "ประเภท", p.item && "รายการ", p.qty != null && "จำนวน", p.amount != null && "จำนวนเงิน"].filter(Boolean);
    toast({ title: got.length ? `ใส่ให้แล้ว: ${got.join(" · ")}` : "ฟังไม่ได้ใจความ ลองพูดใหม่", description: got.length ? "ตรวจความถูกต้องแล้วกด \"บันทึก\"" : "เช่น “ซื้ออาหารปลา 2 กระสอบ 1200 บาท”" });
  };

  const appendTo = (k: "item" | "note") => (t: string) => setForm((f) => ({ ...f, [k]: (f[k] ? f[k] + " " : "") + t }));
  const amountFromVoice = (t: string) => { const p = parseVoice(t + " บาท"); if (p.amount != null) set("amount", String(p.amount)); else toast({ title: "ฟังจำนวนเงินไม่ได้", description: "ลองพูดเป็นตัวเลข เช่น “หนึ่งพันสองร้อยบาท”", variant: "destructive" }); };

  const project = projectOf(form.project);
  const quick = project ? [...project.quick, ...GENERAL_QUICK] : GENERAL_QUICK;
  const amountNum = Number(form.amount.replace(/,/g, ""));
  const canSave = !!form.project && form.item.trim() !== "" && Number.isFinite(amountNum) && amountNum > 0 && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    const row = {
      entry_date: form.date || todayIso(),
      project_key: form.project,
      kind: form.kind,
      item: form.item.trim(),
      qty: form.qty.trim() === "" ? null : Number(form.qty),
      unit: form.unit.trim() || null,
      amount: amountNum,
      note: form.note.trim() || null,
    };
    const { data, error } = await db().insert(row).select().single();
    setSaving(false);
    if (error) {
      return void toast({ title: "บันทึกไม่สำเร็จ", description: error.code === "42501" ? "ไม่มีสิทธิ์บันทึก — ติดต่อผู้ดูแลระบบ" : error.message, variant: "destructive" });
    }
    setEntries((l) => [data as LedgerEntry, ...l]);
    toast({ title: `บันทึกแล้ว ✓ ${project?.emoji ?? ""} ${row.item}`, description: `${row.kind === "income" ? "รายรับ" : "รายจ่าย"} ${money(row.amount)} บาท` });
    setForm((f) => blankForm(f.project, f.kind, f.date));
    setHeard("");
  };

  const remove = async (e: LedgerEntry) => {
    const r = await Swal.fire({
      title: "ลบรายการนี้?", html: `<div style="font-size:20px">${projectOf(e.project_key)?.emoji ?? ""} ${e.item.replace(/</g, "&lt;")}<br/><b>${money(Number(e.amount))} บาท</b></div>`,
      icon: "warning", showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก", confirmButtonColor: "#dc2626",
    });
    if (!r.isConfirmed) return;
    const { error } = await db().delete().eq("id", e.id);
    if (error) return void toast({ title: "ลบไม่สำเร็จ", description: error.message, variant: "destructive" });
    setEntries((l) => l.filter((x) => x.id !== e.id));
    toast({ title: "ลบแล้ว" });
  };

  const shown = useMemo(
    () => entries.filter((e) => (!month || e.entry_date.startsWith(month)) && (!filterProject || e.project_key === filterProject)),
    [entries, month, filterProject],
  );
  const grouped = useMemo(() => {
    const m = new Map<string, LedgerEntry[]>();
    for (const e of shown) m.set(e.entry_date, [...(m.get(e.entry_date) ?? []), e]);
    return [...m.entries()];
  }, [shown]);
  const sum = useMemo(() => summarize(shown), [shown]);
  const maxMoney = Math.max(1, ...sum.rows.map((r) => Math.max(r.income, r.expense)));

  const exportCsv = () => {
    if (shown.length === 0) return toast({ title: "ไม่มีรายการให้ส่งออก", variant: "destructive" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + ledgerCsv(shown)], { type: "text/csv;charset=utf-8" }));
    a.download = `บัญชีโครงการด้วยรัก-${month || "ทั้งหมด"}${filterProject ? "-" + (projectOf(filterProject)?.short ?? filterProject) : ""}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const todayTotal = useMemo(() => summarize(entries.filter((e) => e.entry_date === todayIso())), [entries]);

  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button type="button" onClick={() => setTab(id)} className={`flex-1 rounded-xl py-3 text-base font-bold transition ${tab === id ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground"}`}>{label}</button>
  );

  const filters = (
    <div className="grid grid-cols-2 gap-2">
      <label className="text-sm font-semibold">เดือน
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="mt-1 h-12 text-base" />
      </label>
      <label className="text-sm font-semibold">โครงการ
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="mt-1 h-12 w-full rounded-md border border-input bg-background px-3 text-base">
          <option value="">ทุกโครงการ</option>
          {LEDGER_PROJECTS.map((p) => <option key={p.key} value={p.key}>{p.emoji} {p.short}</option>)}
        </select>
      </label>
      {month && <button type="button" onClick={() => setMonth("")} className="col-span-2 text-left text-sm text-primary underline">ดูทุกเดือน</button>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-3 pb-32 pt-5">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">บัญชีโครงการด้วยรักและห่วงใย</h1>
          <p className="text-sm text-muted-foreground">บันทึกรายรับ-รายจ่ายรายวัน · กดไมค์พูดได้</p>
        </div>

        {loadError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{loadError}<button onClick={() => void load()} className="ml-2 underline">ลองอีกครั้ง</button></div>}

        <div className="mb-4 flex gap-2"><TabBtn id="add" label="✏️ บันทึก" /><TabBtn id="list" label="📒 รายการ" /><TabBtn id="sum" label="📊 สรุป" /></div>

        {tab === "add" && (
          <section className="space-y-4">
            {(todayTotal.income > 0 || todayTotal.expense > 0) && (
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="rounded-xl bg-red-50 p-2 text-red-800">วันนี้จ่าย <b className="block text-lg">{money(todayTotal.expense)}</b></div>
                <div className="rounded-xl bg-green-50 p-2 text-green-800">วันนี้รับ <b className="block text-lg">{money(todayTotal.income)}</b></div>
              </div>
            )}

            {/* พูดทั้งประโยค */}
            <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-3">
              <div className="flex items-center gap-3">
                <MicButton id="all" activeId={micActive} setActiveId={setMicActive} onText={applyVoice} onInterim={setInterim} label="พูดทั้งประโยค" className="h-14 px-5 text-lg" />
                <p className="text-sm text-muted-foreground">เช่น “ซื้ออาหารปลา 2 กระสอบ 1200 บาท” หรือ “ขายไข่ไก่ 3 แผง 270 บาท”</p>
              </div>
              {(interim || heard) && <p className="mt-2 rounded-lg bg-background p-2 text-base">🗣️ {interim || heard}</p>}
              {!speechSupported && <p className="mt-2 text-xs text-amber-700">เบราว์เซอร์นี้ไม่มีไมค์ในเว็บ — แตะช่องพิมพ์แล้วใช้ไมค์บนแป้นพิมพ์มือถือแทนได้</p>}
            </div>

            <div>
              <h2 className="mb-2 text-base font-bold">1. เลือกโครงการ</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {LEDGER_PROJECTS.map((p) => (
                  <button key={p.key} type="button" onClick={() => set("project", p.key)}
                    className={`flex min-h-[64px] items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-base font-semibold transition active:scale-95 ${form.project === p.key ? HUE[p.hue].on : HUE[p.hue].idle}`}>
                    <span className="text-2xl">{p.emoji}</span><span className="leading-tight">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-base font-bold">2. รายรับหรือรายจ่าย</h2>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => set("kind", "expense")} className={`h-14 rounded-xl border-2 text-lg font-bold transition ${form.kind === "expense" ? "border-red-600 bg-red-600 text-white" : "border-red-200 bg-red-50 text-red-800"}`}>➖ รายจ่าย</button>
                <button type="button" onClick={() => set("kind", "income")} className={`h-14 rounded-xl border-2 text-lg font-bold transition ${form.kind === "income" ? "border-green-600 bg-green-600 text-white" : "border-green-200 bg-green-50 text-green-800"}`}>➕ รายรับ</button>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-base font-bold">3. รายการ</h2>
              <div className="mb-2 flex flex-wrap gap-2">
                {quick.filter(([, k]) => k === form.kind).map(([t, k]) => (
                  <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, item: t, kind: k }))}
                    className={`rounded-full border px-3 py-2 text-sm font-medium ${form.item === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{t}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input value={form.item} onChange={(e) => set("item", e.target.value)} placeholder="เช่น ซื้ออาหารปลา" className="h-14 text-lg" />
                <MicButton id="item" activeId={micActive} setActiveId={setMicActive} onText={appendTo("item")} label="" className="h-14 w-14" />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <label className="col-span-2 text-sm font-semibold">จำนวน
                <Input inputMode="decimal" value={form.qty} onChange={(e) => set("qty", e.target.value.replace(/[^\d.]/g, ""))} placeholder="เช่น 2" className="mt-1 h-14 text-lg" />
              </label>
              <label className="col-span-3 text-sm font-semibold">หน่วย
                <Input list="ledger-units" value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="กระสอบ / ตัว / กก." className="mt-1 h-14 text-lg" />
                <datalist id="ledger-units">{UNITS.map((u) => <option key={u} value={u} />)}</datalist>
              </label>
            </div>

            <div>
              <h2 className="mb-2 text-base font-bold">4. จำนวนเงิน (บาท)</h2>
              <div className="flex items-center gap-2">
                <Input inputMode="decimal" value={form.amount} onChange={(e) => set("amount", e.target.value.replace(/[^\d.,]/g, ""))} placeholder="0" className={`h-16 text-right text-3xl font-bold ${form.kind === "income" ? "text-green-700" : "text-red-700"}`} />
                <MicButton id="amount" activeId={micActive} setActiveId={setMicActive} onText={amountFromVoice} label="" className="h-16 w-16" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="text-sm font-semibold">วันที่
                <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="mt-1 h-12 text-base" />
                <span className="text-xs font-normal text-muted-foreground">{form.date ? thaiDate(form.date) : ""}</span>
              </label>
              <div className="text-sm font-semibold">หมายเหตุ (ไม่บังคับ)
                <div className="mt-1 flex items-start gap-2">
                  <Textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={2} className="text-base" />
                  <MicButton id="note" activeId={micActive} setActiveId={setMicActive} onText={appendTo("note")} label="" className="h-12 w-12" />
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "list" && (
          <section className="space-y-3">
            {filters}
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-red-50 p-2 text-red-800">จ่าย<b className="block text-base">{money(sum.expense)}</b></div>
              <div className="rounded-xl bg-green-50 p-2 text-green-800">รับ<b className="block text-base">{money(sum.income)}</b></div>
              <div className={`rounded-xl p-2 ${sum.net >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-orange-50 text-orange-800"}`}>คงเหลือ<b className="block text-base">{money(sum.net)}</b></div>
            </div>
            {loading ? <p className="py-8 text-center text-muted-foreground">กำลังโหลด…</p> : grouped.length === 0 ? <p className="py-8 text-center text-muted-foreground">ยังไม่มีรายการ{month ? `ใน${thaiMonth(month)}` : ""}</p> : grouped.map(([date, list]) => (
              <div key={date}>
                <h3 className="mb-1 mt-3 text-sm font-bold text-muted-foreground">{thaiDate(date)}</h3>
                <ul className="space-y-2">
                  {list.map((e) => (
                    <li key={e.id} className={`flex items-center gap-3 rounded-xl border-l-4 bg-card p-3 shadow-sm ${e.kind === "income" ? "border-green-500" : "border-red-500"}`}>
                      <span className="text-2xl">{projectOf(e.project_key)?.emoji ?? "📦"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-semibold leading-snug">{e.item}</p>
                        <p className="text-xs text-muted-foreground">{projectOf(e.project_key)?.short ?? e.project_key}{e.qty != null ? ` · ${e.qty} ${e.unit ?? ""}` : ""}{e.note ? ` · ${e.note}` : ""}</p>
                      </div>
                      <b className={`shrink-0 text-lg ${e.kind === "income" ? "text-green-700" : "text-red-700"}`}>{e.kind === "income" ? "+" : "−"}{money(Number(e.amount))}</b>
                      {(isAdmin || e.created_by === userId) && (
                        <button type="button" onClick={() => void remove(e)} aria-label="ลบรายการ" className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {tab === "sum" && (
          <section className="space-y-3">
            {filters}
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">{thaiMonth(month)}{filterProject ? ` · ${projectOf(filterProject)?.short}` : ""}</p>
              <p className={`text-4xl font-extrabold ${sum.net >= 0 ? "text-emerald-700" : "text-orange-700"}`}>{sum.net >= 0 ? "+" : "−"}{money(Math.abs(sum.net))}</p>
              <p className="text-sm text-muted-foreground">รับ {money(sum.income)} − จ่าย {money(sum.expense)} บาท</p>
            </div>
            <div className="space-y-2">
              {sum.rows.filter((r) => r.count > 0 && (!filterProject || r.key === filterProject)).map((r) => (
                <div key={r.key} className={`rounded-xl border-2 p-3 ${hueOf(r.key).idle}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{projectOf(r.key)?.emoji} {projectOf(r.key)?.label ?? r.key}</span>
                    <span className="text-xs">{r.count} รายการ</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2"><span className="w-10">รับ</span><div className="h-3 flex-1 overflow-hidden rounded bg-white/70"><div className="h-full bg-green-500" style={{ width: `${(r.income / maxMoney) * 100}%` }} /></div><b className="w-24 text-right">{money(r.income)}</b></div>
                    <div className="flex items-center gap-2"><span className="w-10">จ่าย</span><div className="h-3 flex-1 overflow-hidden rounded bg-white/70"><div className="h-full bg-red-500" style={{ width: `${(r.expense / maxMoney) * 100}%` }} /></div><b className="w-24 text-right">{money(r.expense)}</b></div>
                  </div>
                  <p className={`mt-1 text-right font-bold ${r.net >= 0 ? "text-emerald-800" : "text-orange-800"}`}>{r.net >= 0 ? "กำไร" : "ขาดทุน"} {money(Math.abs(r.net))} บาท</p>
                </div>
              ))}
              {sum.rows.every((r) => r.count === 0) && <p className="py-8 text-center text-muted-foreground">ยังไม่มีรายการ</p>}
            </div>
            <Button onClick={exportCsv} variant="outline" className="h-12 w-full text-base"><Download className="mr-2 h-5 w-5" />ส่งออกเป็นไฟล์ Excel (CSV)</Button>
          </section>
        )}
      </main>

      {tab === "add" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-semibold">{project ? `${project.emoji} ${project.short}` : "ยังไม่เลือกโครงการ"} · {form.kind === "income" ? "รายรับ" : "รายจ่าย"}</p>
              <p className={`font-bold ${form.kind === "income" ? "text-green-700" : "text-red-700"}`}>{amountNum > 0 ? `${money(amountNum)} บาท` : "—"}</p>
            </div>
            <Button onClick={() => void save()} disabled={!canSave} className="h-14 px-8 text-lg font-bold"><Save className="mr-2 h-5 w-5" />{saving ? "กำลังบันทึก…" : "บันทึก"}</Button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProjectLedgerPage;
