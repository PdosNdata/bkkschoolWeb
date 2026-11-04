import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import Swal from "sweetalert2";
import { Download, FileSpreadsheet, Mic, MicOff, Pencil, Printer, Save, Trash2, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  GENERAL_QUICK, LEDGER_PROJECTS, UNITS, ledgerCsv, money, monthOfNow, parseVoice, projectOf, summarize, monthsLabel, thaiDate, thaiMonth, todayIso,
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
function MicButton({ onText, onInterim, label = "พูด", className = "", variant = "soft", activeId, setActiveId, id }: {
  onText: (t: string) => void; onInterim?: (t: string) => void; label?: string; className?: string; variant?: "soft" | "hero"; id: string; activeId: string; setActiveId: Dispatch<SetStateAction<string>>;
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
      className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-full font-semibold transition active:scale-95 ${listening ? "animate-pulse bg-red-600 text-white ring-4 ring-red-300" : variant === "hero" ? "bg-white text-rose-600 shadow-lg" : "bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600 shadow-sm hover:from-rose-200"} ${className}`}>
      {listening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
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
  const [printDetail, setPrintDetail] = useState(true); // รายงานพิมพ์: รวมรายการรายวันด้วยหรือไม่
  const [editingId, setEditingId] = useState(""); // รหัสรายการที่กำลังแก้ไข (ว่าง = เพิ่มรายการใหม่)
  const [userId, setUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [owners, setOwners] = useState<Record<string, string>>({}); // user_id → อีเมล (แอดมินดูว่าใครบันทึก)
  const [months, setMonths] = useState<string[]>([monthOfNow()]); // ว่าง = ทุกเดือน
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
      if (r?.data === true) {
        // แอดมินเห็นรายการของทุกคน — ดึงอีเมลมาแสดงว่าใครบันทึก (ถ้าอ่านไม่ได้ก็ข้าม)
        const u = await supabase.from("user_roles").select("user_id, email");
        if (!u.error) setOwners(Object.fromEntries((u.data ?? []).filter((x) => x.email).map((x) => [x.user_id, x.email as string])));
      }
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
    const editing = editingId !== "";
    const { data, error } = editing ? await db().update(row).eq("id", editingId).select().single() : await db().insert(row).select().single();
    setSaving(false);
    if (error) {
      // update ที่ไม่มีสิทธิ์ (ไม่ใช่เจ้าของ/แอดมิน) ไม่ได้แถวกลับมา
      const denied = error.code === "42501" || error.code === "PGRST116";
      return void toast({ title: editing ? "แก้ไขไม่สำเร็จ" : "บันทึกไม่สำเร็จ", description: denied ? (editing ? "แก้ไขได้เฉพาะรายการที่ตัวเองบันทึก (หรือแอดมิน)" : "ไม่มีสิทธิ์บันทึก — ติดต่อผู้ดูแลระบบ") : error.message, variant: "destructive" });
    }
    if (editing) {
      setEntries((l) => l.map((x) => (x.id === editingId ? (data as LedgerEntry) : x)));
      setEditingId("");
      setForm(blankForm(row.project_key, row.kind));
      setHeard("");
      setTab("list");
      return void toast({ title: `แก้ไขแล้ว ✓ ${project?.emoji ?? ""} ${row.item}`, description: `${row.kind === "income" ? "รายรับ" : "รายจ่าย"} ${money(row.amount)} บาท` });
    }
    setEntries((l) => [data as LedgerEntry, ...l]);
    toast({ title: `บันทึกแล้ว ✓ ${project?.emoji ?? ""} ${row.item}`, description: `${row.kind === "income" ? "รายรับ" : "รายจ่าย"} ${money(row.amount)} บาท` });
    setForm((f) => blankForm(f.project, f.kind, f.date));
    setHeard("");
  };

  /** เปิดรายการเดิมในฟอร์มบันทึกเพื่อแก้ไข */
  const startEdit = (e: LedgerEntry) => {
    setForm({ date: e.entry_date, project: e.project_key, kind: e.kind, item: e.item, qty: e.qty != null ? String(e.qty) : "", unit: e.unit ?? "", amount: String(e.amount), note: e.note ?? "" });
    setEditingId(e.id);
    setHeard("");
    setTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEdit = () => { setEditingId(""); setForm(blankForm()); setHeard(""); };

  const remove = async (e: LedgerEntry) => {
    const r = await Swal.fire({
      title: "ลบรายการนี้?", html: `<div style="font-size:20px">${projectOf(e.project_key)?.emoji ?? ""} ${e.item.replace(/</g, "&lt;")}<br/><b>${money(Number(e.amount))} บาท</b></div>`,
      icon: "warning", showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก", confirmButtonColor: "#dc2626",
    });
    if (!r.isConfirmed) return;
    const { error } = await db().delete().eq("id", e.id);
    if (error) return void toast({ title: "ลบไม่สำเร็จ", description: error.message, variant: "destructive" });
    setEntries((l) => l.filter((x) => x.id !== e.id));
    if (editingId === e.id) cancelEdit();
    toast({ title: "ลบแล้ว" });
  };

  const shown = useMemo(
    () => entries.filter((e) => (months.length === 0 || months.includes(e.entry_date.slice(0, 7))) && (!filterProject || e.project_key === filterProject)),
    [entries, months, filterProject],
  );
  const monthKey = months.length ? [...months].sort().join("_") : "ทั้งหมด";
  const monthLabel = monthsLabel(months);
  const monthChoices = useMemo(() => {
    const set = new Set<string>([monthOfNow(), ...entries.map((e) => e.entry_date.slice(0, 7)), ...months]);
    return [...set].sort().reverse();
  }, [entries, months]);
  const toggleMonth = (m: string) => setMonths((l) => (l.includes(m) ? l.filter((x) => x !== m) : [...l, m].sort()));
  const grouped = useMemo(() => {
    const m = new Map<string, LedgerEntry[]>();
    for (const e of shown) m.set(e.entry_date, [...(m.get(e.entry_date) ?? []), e]);
    return [...m.entries()];
  }, [shown]);
  const sum = useMemo(() => summarize(shown), [shown]);
  const maxMoney = Math.max(1, ...sum.rows.map((r) => Math.max(r.income, r.expense)));

  /** รายการที่แสดงอยู่และผู้ใช้ลบได้ (เจ้าของรายการ หรือแอดมินลบได้ทุกรายการ) */
  const deletable = useMemo(() => shown.filter((e) => isAdmin || e.created_by === userId), [shown, isAdmin, userId]);

  /** ลบทั้งหมดของเดือนที่เลือก (ตามตัวกรองโครงการด้วย) — ต้องพิมพ์ "ลบ" ยืนยัน */
  const removeMonth = async () => {
    if (months.length === 0 || deletable.length === 0) return;
    const scope = `${monthLabel}${filterProject ? ` · ${projectOf(filterProject)?.short ?? ""}` : " · ทุกโครงการ"}`;
    const total = deletable.reduce((a, e) => a + (e.kind === "income" ? 1 : -1) * Number(e.amount), 0);
    const others = shown.length - deletable.length;
    const r = await Swal.fire({
      title: "ลบทั้งหมดของเดือนที่เลือก?",
      html: `<div style="font-size:19px;line-height:1.5"><b>${scope}</b><br/>จะลบ <b style="color:#dc2626">${deletable.length} รายการ</b> (คงเหลือสุทธิ ${money(total)} บาท)<br/>ลบแล้ว<b>กู้คืนไม่ได้</b> — ควรส่งออก Excel (CSV) เก็บไว้ก่อน${others > 0 ? `<br/><span style="color:#b45309">ไม่รวม ${others} รายการที่คนอื่นบันทึก (ลบไม่ได้)</span>` : ""}<br/><br/>พิมพ์คำว่า <b>ลบ</b> เพื่อยืนยัน</div>`,
      icon: "warning", input: "text", inputPlaceholder: "ลบ", showCancelButton: true, confirmButtonText: "ลบทั้งหมด", cancelButtonText: "ยกเลิก", confirmButtonColor: "#dc2626",
      inputValidator: (v) => (v.trim() === "ลบ" ? undefined : "พิมพ์คำว่า ลบ ให้ตรงเพื่อยืนยัน"),
    });
    if (!r.isConfirmed) return;
    const ids = deletable.map((e) => e.id);
    const gone = new Set<string>();
    for (let i = 0; i < ids.length; i += 100) {
      const { data, error } = await db().delete().in("id", ids.slice(i, i + 100)).select("id");
      if (error) { toast({ title: "ลบไม่สำเร็จ", description: error.message, variant: "destructive" }); break; }
      for (const x of (data ?? []) as { id: string }[]) gone.add(x.id);
    }
    setEntries((l) => l.filter((x) => !gone.has(x.id)));
    if (editingId && gone.has(editingId)) cancelEdit();
    toast({ title: `ลบแล้ว ${gone.size} รายการ`, description: gone.size < ids.length ? `ลบไม่ได้ ${ids.length - gone.size} รายการ (ไม่มีสิทธิ์หรือเกิดข้อผิดพลาด)` : scope });
  };

  const printReport = () => {
    if (shown.length === 0) return toast({ title: "ไม่มีรายการให้พิมพ์", variant: "destructive" });
    const old = document.title;
    document.title = `รายงานสรุปบัญชีโครงการด้วยรัก-${monthKey}${filterProject ? "-" + (projectOf(filterProject)?.short ?? filterProject) : ""}`;
    window.addEventListener("afterprint", () => { document.title = old; }, { once: true });
    window.print();
  };

  /** ส่งออกเป็นไฟล์ Excel (.xlsx) จัดสี/หน้ากระดาษ A4 พร้อมพิมพ์: แผ่น "สรุป" และ "รายการรายวัน" */
  const exportXlsx = async () => {
    if (shown.length === 0) return toast({ title: "ไม่มีรายการให้ส่งออก", variant: "destructive" });
    try {
      const { exportLedgerXlsx } = await import("@/lib/projectLedgerXlsx"); // โหลด exceljs เมื่อกดใช้เท่านั้น
      await exportLedgerXlsx(shown, { monthLabel, monthKey, projectKey: filterProject });
    } catch (e) {
      toast({ title: "ส่งออก Excel ไม่สำเร็จ", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  };

  const exportCsv = () => {
    if (shown.length === 0) return toast({ title: "ไม่มีรายการให้ส่งออก", variant: "destructive" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + ledgerCsv(shown)], { type: "text/csv;charset=utf-8" }));
    a.download = `บัญชีโครงการด้วยรัก-${monthKey}${filterProject ? "-" + (projectOf(filterProject)?.short ?? filterProject) : ""}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const todayTotal = useMemo(() => summarize(entries.filter((e) => e.entry_date === todayIso())), [entries]);
  const monthTotal = useMemo(() => summarize(entries.filter((e) => e.entry_date.startsWith(monthOfNow()))), [entries]);

  const QUICK_AMOUNTS = [20, 50, 100, 200, 500, 1000];
  const addAmount = (n: number) => set("amount", String(Math.round(((Number(form.amount.replace(/,/g, "")) || 0) + n) * 100) / 100));
  const stepQty = (d: number) => set("qty", String(Math.max(0, Math.round(((Number(form.qty) || 0) + d) * 100) / 100)));

  // ฟังก์ชันธรรมดา (ไม่ใช่คอมโพเนนต์) เพื่อไม่ให้ช่องกรอกถูกสร้างใหม่ทุกครั้งที่พิมพ์ — โฟกัสจะได้ไม่หลุด
  const tabBtn = (id: Tab, icon: string, label: string) => (
    <button key={id} type="button" onClick={() => setTab(id)}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3 text-base lg:flex-none lg:justify-start lg:px-4 font-bold transition active:scale-95 ${tab === id ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md" : "text-slate-500"}`}>
      <span className="text-xl">{icon}</span>{label}
    </button>
  );
  const panel = (n: number, title: string, body: React.ReactNode) => (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-extrabold text-white shadow">{n}</span>{title}
      </h2>
      {body}
    </section>
  );

  const filters = (
    <div className="grid grid-cols-2 gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="col-span-2 text-sm font-bold text-slate-700">📅 เดือน <span className="font-normal text-slate-500">(แตะเลือกได้หลายเดือน)</span>
        <div className="mt-2 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
          <button type="button" onClick={() => setMonths([])}
            className={`rounded-xl px-4 py-2.5 text-left text-sm font-bold ring-1 transition active:scale-95 ${months.length === 0 ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-300"}`}>ทุกเดือน</button>
          {monthChoices.map((m) => (
            <button key={m} type="button" onClick={() => toggleMonth(m)}
              className={`rounded-xl px-4 py-2.5 text-left text-sm font-bold ring-1 transition active:scale-95 ${months.includes(m) ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-300"}`}>{months.includes(m) ? "✓ " : ""}{thaiMonth(m)}</button>
          ))}
        </div>
      </div>
      <label className="col-span-2 text-sm font-bold text-slate-700">🌱 โครงการ
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="mt-1 h-12 w-full rounded-xl border border-input bg-background px-3 text-base">
          <option value="">ทุกโครงการ</option>
          {LEDGER_PROJECTS.map((p) => <option key={p.key} value={p.key}>{p.emoji} {p.short}</option>)}
        </select>
      </label>
    </div>
  );

  const stat = (label: string, value: number, tone: string) => (
    <div className={`rounded-2xl px-2 py-2 text-center ${tone}`}>
      <p className="text-xs font-semibold opacity-90">{label}</p>
      <p className="text-lg font-extrabold leading-tight">{money(value)}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50">
      <style>{"@media print{@page{size:A4;margin:12mm}}"}</style>
      <div className="print:hidden"><Header /></div>
      <main className={`container mx-auto max-w-2xl space-y-4 px-3 pb-36 pt-4 lg:grid lg:max-w-5xl lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-4 lg:space-y-0 [&>*]:lg:col-start-2${tab === "sum" ? " print:hidden" : ""}`}>
        {/* หัวเรื่อง + ยอดสรุปย่อ */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 p-5 text-white shadow-lg lg:!col-span-2 lg:!col-start-1">
          <span className="pointer-events-none absolute -right-4 -top-5 text-8xl opacity-20">🌱</span>
          <span className="pointer-events-none absolute -bottom-6 left-24 text-7xl opacity-10">🐟</span>
          <h1 className="relative text-2xl font-extrabold leading-tight drop-shadow sm:text-3xl">บัญชีโครงการด้วยรักและห่วงใย</h1>
          <p className="relative text-sm text-white/90">บันทึกรายรับ-รายจ่ายรายวัน · กดไมค์พูดได้</p>
          <p className="relative mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold">{isAdmin ? "👑 แอดมิน: เห็นรายการของทุกคน" : "🔒 เห็นเฉพาะรายการของคุณ"}</p>
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {stat("วันนี้จ่าย", todayTotal.expense, "bg-white/20 text-white backdrop-blur")}
            {stat("วันนี้รับ", todayTotal.income, "bg-white/20 text-white backdrop-blur")}
            {stat("เดือนนี้คงเหลือ", monthTotal.net, "bg-white text-emerald-800")}
          </div>
        </div>

        {loadError && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{loadError}<button onClick={() => void load()} className="ml-2 font-bold underline">ลองอีกครั้ง</button></div>}

        <div className="flex gap-1 rounded-3xl bg-white p-1.5 shadow-sm ring-1 ring-black/5 lg:sticky lg:top-4 lg:row-span-6 lg:row-start-2 lg:flex-col lg:!col-start-1">{tabBtn("add", "✏️", "บันทึก")}{tabBtn("list", "📒", "รายการ")}{tabBtn("sum", "📊", "สรุป")}</div>

        {tab === "add" && (
          <div className="space-y-4">
            {editingId && (
              <div className="flex items-center gap-3 rounded-3xl border-2 border-amber-300 bg-amber-50 p-3 text-amber-900 shadow-sm">
                <Pencil className="h-6 w-6 shrink-0" />
                <p className="min-w-0 flex-1 text-base font-bold leading-snug">กำลังแก้ไขรายการเดิม<span className="block text-sm font-normal">แก้แล้วกด "บันทึกการแก้ไข" ที่ด้านล่าง</span></p>
                <button type="button" onClick={cancelEdit} className="flex shrink-0 items-center gap-1 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-amber-900 shadow-sm active:scale-95"><X className="h-4 w-4" />ยกเลิก</button>
              </div>
            )}
            {/* พูดทั้งประโยค */}
            <div className="rounded-3xl bg-gradient-to-br from-rose-500 to-orange-400 p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <MicButton id="all" variant="hero" activeId={micActive} setActiveId={setMicActive} onText={applyVoice} onInterim={setInterim} label="แตะแล้วพูด" className="h-16 px-6 text-xl" />
                <p className="text-sm leading-snug text-white/95">พูดทั้งประโยค เช่น<br />“ซื้ออาหารปลา 2 กระสอบ 1200 บาท”<br />“ขายไข่ไก่ 3 แผง 270 บาท”</p>
              </div>
              {(interim || heard) && <p className="mt-3 rounded-2xl bg-white/95 p-3 text-base font-medium text-slate-800">🗣️ {interim || heard}</p>}
              {!speechSupported && <p className="mt-2 rounded-xl bg-white/90 p-2 text-xs text-amber-800">เบราว์เซอร์นี้ไม่มีไมค์ในเว็บ — แตะช่องพิมพ์แล้วใช้ไมค์บนแป้นพิมพ์มือถือแทนได้</p>}
            </div>

            {panel(1, "เลือกโครงการ", (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {LEDGER_PROJECTS.map((p) => {
                  const on = form.project === p.key;
                  return (
                    <button key={p.key} type="button" onClick={() => set("project", p.key)}
                      className={`relative flex min-h-[72px] items-center gap-2.5 rounded-2xl border-2 px-3 py-2 text-left text-base font-bold transition active:scale-95 ${on ? `${HUE[p.hue].on} scale-[1.02] shadow-lg` : HUE[p.hue].idle}`}>
                      <span className="text-3xl drop-shadow-sm">{p.emoji}</span>
                      <span className="leading-tight">{p.label}</span>
                      {on && <span className="absolute right-2 top-1.5 text-sm">✓</span>}
                    </button>
                  );
                })}
              </div>
            ))}

            {panel(2, "รายรับหรือรายจ่าย", (
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => set("kind", "expense")} className={`h-16 rounded-2xl text-xl font-extrabold transition active:scale-95 ${form.kind === "expense" ? "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg ring-4 ring-red-200" : "bg-red-50 text-red-700"}`}>➖ รายจ่าย</button>
                <button type="button" onClick={() => set("kind", "income")} className={`h-16 rounded-2xl text-xl font-extrabold transition active:scale-95 ${form.kind === "income" ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg ring-4 ring-green-200" : "bg-green-50 text-green-700"}`}>➕ รายรับ</button>
              </div>
            ))}

            {panel(3, "รายการ", (
              <>
                <p className="mb-2 text-sm text-slate-500">แตะเลือกรายการที่ใช้บ่อย หรือพิมพ์/พูดเอง</p>
                <div className="mb-3 flex flex-wrap gap-2">
                  {quick.filter(([, k]) => k === form.kind).map(([t, k]) => (
                    <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, item: t, kind: k }))}
                      className={`rounded-full border-2 px-4 py-2.5 text-base font-semibold transition active:scale-95 ${form.item === t ? (k === "income" ? "border-green-600 bg-green-600 text-white" : "border-red-600 bg-red-600 text-white") : (k === "income" ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900")}`}>{t}</button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input value={form.item} onChange={(e) => set("item", e.target.value)} placeholder="เช่น ซื้ออาหารปลา" className="h-14 rounded-2xl text-lg" />
                  <MicButton id="item" activeId={micActive} setActiveId={setMicActive} onText={appendTo("item")} label="" className="h-14 w-14" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1 text-sm font-bold text-slate-700">จำนวน</p>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => stepQty(-1)} aria-label="ลดจำนวน" className="h-14 w-12 shrink-0 rounded-2xl bg-slate-100 text-2xl font-bold text-slate-700 active:scale-95">−</button>
                      <Input inputMode="decimal" value={form.qty} onChange={(e) => set("qty", e.target.value.replace(/[^\d.]/g, ""))} placeholder="0" className="h-14 min-w-0 rounded-2xl px-1 text-center text-xl font-bold" />
                      <button type="button" onClick={() => stepQty(1)} aria-label="เพิ่มจำนวน" className="h-14 w-12 shrink-0 rounded-2xl bg-slate-100 text-2xl font-bold text-slate-700 active:scale-95">+</button>
                    </div>
                  </div>
                  <label className="text-sm font-bold text-slate-700">หน่วย
                    <Input list="ledger-units" value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="กระสอบ/ตัว/กก." className="mt-1 h-14 rounded-2xl text-lg" />
                    <datalist id="ledger-units">{UNITS.map((u) => <option key={u} value={u} />)}</datalist>
                  </label>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {UNITS.slice(0, 8).map((u) => <button key={u} type="button" onClick={() => set("unit", u)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${form.unit === u ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"}`}>{u}</button>)}
                </div>
              </>
            ))}

            {panel(4, "จำนวนเงิน (บาท)", (
              <div className={`rounded-2xl p-3 ${form.kind === "income" ? "bg-green-50" : "bg-red-50"}`}>
                <div className="flex items-center gap-2">
                  <Input inputMode="decimal" value={form.amount} onChange={(e) => set("amount", e.target.value.replace(/[^\d.,]/g, ""))} placeholder="0" className={`h-20 rounded-2xl border-0 bg-white text-right text-4xl font-extrabold shadow-inner ${form.kind === "income" ? "text-green-700" : "text-red-700"}`} />
                  <MicButton id="amount" activeId={micActive} setActiveId={setMicActive} onText={amountFromVoice} label="" className="h-20 w-16" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((n) => <button key={n} type="button" onClick={() => addAmount(n)} className="rounded-full bg-white px-4 py-2.5 text-base font-bold text-slate-800 shadow-sm ring-1 ring-black/10 active:scale-95">+{money(n)}</button>)}
                  <button type="button" onClick={() => set("amount", "")} className="rounded-full bg-slate-800 px-4 py-2.5 text-base font-bold text-white active:scale-95">ล้าง</button>
                </div>
              </div>
            ))}

            {panel(5, "วันที่และหมายเหตุ", (
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">📅 วันที่
                  <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="mt-1 h-14 rounded-2xl text-lg" />
                  <span className="text-sm font-normal text-slate-500">{form.date ? thaiDate(form.date) : ""}</span>
                </label>
                <div className="flex items-start gap-2">
                  <Textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={2} placeholder="หมายเหตุ (ไม่บังคับ)" className="rounded-2xl text-base" />
                  <MicButton id="note" activeId={micActive} setActiveId={setMicActive} onText={appendTo("note")} label="" className="h-14 w-14" />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "list" && (
          <section className="space-y-3">
            {filters}
            <div className="grid grid-cols-3 gap-2">
              {stat("จ่าย", sum.expense, "bg-red-100 text-red-800")}
              {stat("รับ", sum.income, "bg-green-100 text-green-800")}
              {stat("คงเหลือ", sum.net, sum.net >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800")}
            </div>
            {months.length > 0 && deletable.length > 0 && (
              <button type="button" onClick={() => void removeMonth()} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-white text-base font-bold text-red-600 active:scale-95">
                <Trash2 className="h-5 w-5" />ลบทั้งหมดของ {monthLabel}{filterProject ? ` (${projectOf(filterProject)?.short})` : ""} · {deletable.length} รายการ
              </button>
            )}
            {loading ? <p className="py-10 text-center text-slate-500">กำลังโหลด…</p> : grouped.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-black/5"><p className="text-4xl">📭</p><p className="mt-2">ยังไม่มีรายการ{months.length ? `ใน${monthLabel}` : ""}</p></div>
            ) : grouped.map(([date, list]) => (
              <div key={date}>
                <h3 className="mb-2 mt-4 flex items-center gap-2 text-sm font-extrabold text-slate-600"><span className="rounded-full bg-slate-800 px-3 py-1 text-white">{thaiDate(date)}</span></h3>
                <ul className="space-y-2">
                  {list.map((e) => (
                    <li key={e.id} className={`flex items-center gap-3 rounded-2xl border-l-8 bg-white p-3 shadow-sm ring-1 ring-black/5 ${e.kind === "income" ? "border-green-500" : "border-red-500"}`}>
                      <span className="text-3xl">{projectOf(e.project_key)?.emoji ?? "📦"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-base font-bold leading-snug text-slate-800">{e.item}</p>
                        <p className="text-xs text-slate-500">{projectOf(e.project_key)?.short ?? e.project_key}{e.qty != null ? ` · ${e.qty} ${e.unit ?? ""}` : ""}{e.note ? ` · ${e.note}` : ""}{isAdmin ? ` · โดย ${owners[e.created_by ?? ""] ?? (e.created_by === userId ? "คุณ" : "ผู้ใช้อื่น")}` : ""}</p>
                      </div>
                      <b className={`shrink-0 text-lg ${e.kind === "income" ? "text-green-700" : "text-red-700"}`}>{e.kind === "income" ? "+" : "−"}{money(Number(e.amount))}</b>
                      {(isAdmin || e.created_by === userId) && (
                        <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                          <button type="button" onClick={() => startEdit(e)} aria-label="แก้ไขรายการ" className={`rounded-full p-2.5 hover:bg-sky-50 hover:text-sky-700 ${editingId === e.id ? "bg-sky-100 text-sky-700" : "text-slate-400"}`}><Pencil className="h-5 w-5" /></button>
                          <button type="button" onClick={() => void remove(e)} aria-label="ลบรายการ" className="rounded-full p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
                        </div>
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
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-center text-white shadow-lg">
              <p className="text-sm text-white/90">{monthLabel}{filterProject ? ` · ${projectOf(filterProject)?.short}` : ""}</p>
              <p className="my-1 text-5xl font-extrabold drop-shadow">{sum.net >= 0 ? "+" : "−"}{money(Math.abs(sum.net))}</p>
              <p className="text-sm text-white/90">รับ {money(sum.income)} − จ่าย {money(sum.expense)} บาท</p>
            </div>
            <div className="space-y-3">
              {sum.rows.filter((r) => r.count > 0 && (!filterProject || r.key === filterProject)).map((r) => (
                <div key={r.key} className={`rounded-3xl border-2 p-4 shadow-sm ${hueOf(r.key).idle}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold">{projectOf(r.key)?.emoji} {projectOf(r.key)?.label ?? r.key}</span>
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">{r.count} รายการ</span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2"><span className="w-9 font-semibold">รับ</span><div className="h-4 flex-1 overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full bg-green-500" style={{ width: `${(r.income / maxMoney) * 100}%` }} /></div><b className="w-24 text-right">{money(r.income)}</b></div>
                    <div className="flex items-center gap-2"><span className="w-9 font-semibold">จ่าย</span><div className="h-4 flex-1 overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full bg-red-500" style={{ width: `${(r.expense / maxMoney) * 100}%` }} /></div><b className="w-24 text-right">{money(r.expense)}</b></div>
                  </div>
                  <p className={`mt-2 text-right text-base font-extrabold ${r.net >= 0 ? "text-emerald-800" : "text-orange-800"}`}>{r.net >= 0 ? "กำไร" : "ขาดทุน"} {money(Math.abs(r.net))} บาท</p>
                </div>
              ))}
              {sum.rows.every((r) => r.count === 0) && <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-black/5"><p className="text-4xl">📊</p><p className="mt-2">ยังไม่มีรายการ</p></div>}
            </div>
            <div className="space-y-2 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <label className="flex items-center gap-3 text-base font-semibold text-slate-700"><input type="checkbox" checked={printDetail} onChange={(e) => setPrintDetail(e.target.checked)} className="h-6 w-6 accent-emerald-600" />รวมรายการรายวันในรายงานที่พิมพ์</label>
              <Button onClick={printReport} className="h-14 w-full rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-base font-bold text-white hover:from-sky-700 hover:to-indigo-700"><Printer className="mr-2 h-5 w-5" />พิมพ์รายงานสรุป / บันทึกเป็น PDF</Button>
              <Button onClick={() => void exportXlsx()} className="h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-base font-bold text-white hover:from-emerald-700 hover:to-green-700"><FileSpreadsheet className="mr-2 h-5 w-5" />ส่งออก Excel (.xlsx)</Button>
              <Button onClick={exportCsv} variant="outline" className="h-12 w-full rounded-2xl text-sm font-semibold"><Download className="mr-2 h-4 w-4" />ส่งออกแบบ CSV (ข้อมูลล้วน)</Button>
            </div>
          </section>
        )}
      </main>

      {tab === "add" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-600">{editingId ? "✏️ แก้ไข · " : ""}{project ? `${project.emoji} ${project.short}` : "ยังไม่เลือกโครงการ"} · {form.kind === "income" ? "รายรับ" : "รายจ่าย"}</p>
              <p className={`text-xl font-extrabold leading-tight ${form.kind === "income" ? "text-green-700" : "text-red-700"}`}>{amountNum > 0 ? `${money(amountNum)} บาท` : "—"}</p>
            </div>
            <Button onClick={() => void save()} disabled={!canSave} className="h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 text-lg font-extrabold text-white shadow-lg hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"><Save className="mr-2 h-5 w-5" />{saving ? "กำลังบันทึก…" : editingId ? "บันทึกการแก้ไข" : "บันทึก"}</Button>
          </div>
          {!canSave && !saving && <p className="mx-auto mt-1 max-w-2xl text-center text-xs text-slate-500">{!form.project ? "เลือกโครงการ" : !form.item.trim() ? "ใส่รายการ" : "ใส่จำนวนเงิน"}ก่อนกดบันทึก</p>}
        </div>
      )}
      {tab === "sum" && (
        <div className="hidden px-1 text-black print:block">
          <h1 className="text-center text-xl font-bold">รายงานสรุปบัญชีโครงการด้วยรักและห่วงใย</h1>
          <p className="text-center text-base">โรงเรียนบ้านค้อดอนแคน</p>
          <p className="mb-3 text-center text-sm">ช่วงเวลา: {monthLabel} · {filterProject ? `โครงการ${projectOf(filterProject)?.label ?? ""}` : "ทุกโครงการ"} · พิมพ์เมื่อ {thaiDate(todayIso())}</p>
          <table className="w-full border-collapse text-sm">
            <thead><tr className="bg-gray-100">{["โครงการ", "รายการ", "รายรับ (บาท)", "รายจ่าย (บาท)", "คงเหลือ (บาท)"].map((h) => <th key={h} className="border border-black px-2 py-1">{h}</th>)}</tr></thead>
            <tbody>
              {sum.rows.filter((r) => r.count > 0).map((r) => (
                <tr key={r.key}><td className="border border-black px-2 py-1">{projectOf(r.key)?.label ?? r.key}</td><td className="border border-black px-2 py-1 text-center">{r.count}</td><td className="border border-black px-2 py-1 text-right">{money(r.income)}</td><td className="border border-black px-2 py-1 text-right">{money(r.expense)}</td><td className="border border-black px-2 py-1 text-right">{money(r.net)}</td></tr>
              ))}
              <tr className="bg-gray-100 font-bold"><td className="border border-black px-2 py-1">รวมทั้งหมด</td><td className="border border-black px-2 py-1 text-center">{shown.length}</td><td className="border border-black px-2 py-1 text-right">{money(sum.income)}</td><td className="border border-black px-2 py-1 text-right">{money(sum.expense)}</td><td className="border border-black px-2 py-1 text-right">{money(sum.net)}</td></tr>
            </tbody>
          </table>
          {printDetail && (
            <>
              <h2 className="mb-1 mt-5 text-base font-bold">รายการรายวัน</h2>
              <table className="w-full border-collapse text-xs">
                <thead><tr className="bg-gray-100">{["วันที่", "โครงการ", "รายการ", "จำนวน", "รายรับ", "รายจ่าย"].map((h) => <th key={h} className="border border-black px-1.5 py-1">{h}</th>)}</tr></thead>
                <tbody>
                  {[...shown].sort((a, b) => a.entry_date.localeCompare(b.entry_date) || a.created_at.localeCompare(b.created_at)).map((e) => (
                    <tr key={e.id} className="break-inside-avoid">
                      <td className="border border-black px-1.5 py-0.5 whitespace-nowrap">{thaiDate(e.entry_date)}</td>
                      <td className="border border-black px-1.5 py-0.5">{projectOf(e.project_key)?.short ?? e.project_key}</td>
                      <td className="border border-black px-1.5 py-0.5">{e.item}{e.note ? ` (${e.note})` : ""}</td>
                      <td className="border border-black px-1.5 py-0.5 text-center whitespace-nowrap">{e.qty != null ? `${e.qty} ${e.unit ?? ""}` : ""}</td>
                      <td className="border border-black px-1.5 py-0.5 text-right">{e.kind === "income" ? money(Number(e.amount)) : ""}</td>
                      <td className="border border-black px-1.5 py-0.5 text-right">{e.kind === "expense" ? money(Number(e.amount)) : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          <div className="mt-10 grid grid-cols-2 gap-8 break-inside-avoid text-center text-sm">
            <div>ลงชื่อ ……………………………………… ผู้จัดทำ<br />( ……………………………………… )</div>
            <div>ลงชื่อ ……………………………………… ผู้อำนวยการโรงเรียน<br />( ……………………………………… )</div>
          </div>
        </div>
      )}
      <div className="print:hidden"><Footer /></div>
    </div>
  );
};

export default ProjectLedgerPage;
