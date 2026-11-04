// บัญชีรายรับ-รายจ่ายของโครงการด้วยรักและห่วงใย (เลี้ยงปลา กบ ไก่ ปลูกผัก ฯลฯ)
// ตัวช่วยล้วน ๆ ไม่แตะฐานข้อมูล: รายชื่อโครงการ ปุ่มรายการด่วน แยกคำพูด สรุป และ CSV

export type LedgerKind = "expense" | "income";

export interface LedgerProject {
  key: string;
  label: string;
  short: string;
  emoji: string;
  /** คำที่ใช้เดาโครงการจากเสียงพูด (เฉพาะเจาะจงก่อน) */
  words: string[];
  /** ปุ่มรายการด่วน: [ข้อความ, รายรับ/รายจ่าย] */
  quick: [string, LedgerKind][];
  hue: string; // สีประจำโครงการ (tailwind: เฉพาะชื่อที่มีใน safelist ของ class ด้านล่าง)
}

export const LEDGER_PROJECTS: LedgerProject[] = [
  { key: "catfish", label: "เลี้ยงปลาดุก", short: "ปลาดุก", emoji: "🐟", words: ["ปลาดุก", "ปลา"], hue: "sky",
    quick: [["ซื้อลูกปลา", "expense"], ["ซื้ออาหารปลา", "expense"], ["ซื้อจุลินทรีย์/ยาปลา", "expense"], ["ขายปลา", "income"], ["ขายอาหารปลา", "income"]] },
  { key: "frog", label: "เลี้ยงกบ", short: "กบ", emoji: "🐸", words: ["กบ"], hue: "emerald",
    quick: [["ซื้อลูกกบ", "expense"], ["ซื้ออาหารกบ", "expense"], ["ซื้อวัสดุทำบ่อ", "expense"], ["ขายกบ", "income"]] },
  { key: "chicken", label: "เลี้ยงไก่", short: "ไก่", emoji: "🐔", words: ["ไก่"], hue: "amber",
    quick: [["ซื้อลูกไก่", "expense"], ["ซื้ออาหารไก่", "expense"], ["ซื้อวัคซีน/ยาไก่", "expense"], ["ขายไข่ไก่", "income"], ["ขายไก่", "income"]] },
  { key: "boar", label: "เลี้ยงหมูป่า", short: "หมูป่า", emoji: "🐗", words: ["หมูป่า", "หมู"], hue: "stone",
    quick: [["ซื้อลูกหมูป่า", "expense"], ["ซื้ออาหารหมูป่า", "expense"], ["ซื้อยา/วัคซีน", "expense"], ["ขายหมูป่า", "income"]] },
  { key: "veg", label: "ปลูกผัก (ซื้อพันธุ์พืช)", short: "ปลูกผัก", emoji: "🥬", words: ["ปลูกผัก", "พันธุ์พืช", "เมล็ดพันธุ์", "ผัก"], hue: "green",
    quick: [["ซื้อเมล็ดพันธุ์", "expense"], ["ซื้อต้นกล้า", "expense"], ["ซื้อปุ๋ย", "expense"], ["ขายผัก", "income"]] },
  { key: "lime", label: "ปลูกมะนาว", short: "มะนาว", emoji: "🍋", words: ["มะนาว"], hue: "lime",
    quick: [["ซื้อกิ่งพันธุ์มะนาว", "expense"], ["ซื้อปุ๋ย", "expense"], ["ซื้อบ่อซีเมนต์/วัสดุ", "expense"], ["ขายมะนาว", "income"]] },
  { key: "vine", label: "ปลูกพันธุ์ไม้เลื้อย", short: "ไม้เลื้อย", emoji: "🌿", words: ["ไม้เลื้อย"], hue: "teal",
    quick: [["ซื้อพันธุ์ไม้เลื้อย", "expense"], ["ซื้อร้านไม้/ค้าง", "expense"], ["ซื้อปุ๋ย", "expense"], ["ขายผลผลิต", "income"]] },
  { key: "dragon", label: "แก้วมังกร", short: "แก้วมังกร", emoji: "🌵", words: ["แก้วมังกร"], hue: "pink",
    quick: [["ซื้อกิ่งพันธุ์แก้วมังกร", "expense"], ["ซื้อเสาหลัก/วัสดุ", "expense"], ["ซื้อปุ๋ย", "expense"], ["ขายแก้วมังกร", "income"]] },
  { key: "mulberry", label: "ปลูกมอนเบอร์รี่", short: "มอนเบอร์รี่", emoji: "🫐", words: ["มอนเบอร์รี่", "มัลเบอร์รี่", "มอลเบอร์รี่", "มอนเบอรี่", "มัลเบอรี่", "เบอร์รี่"], hue: "violet",
    quick: [["ซื้อกิ่งพันธุ์มอนเบอร์รี่", "expense"], ["ซื้อปุ๋ย", "expense"], ["ขายผลมอนเบอร์รี่", "income"], ["ขายกิ่งพันธุ์", "income"]] },
  { key: "otherveg", label: "ผักอื่น ๆ", short: "ผักอื่น ๆ", emoji: "🥒", words: ["ผักอื่น"], hue: "orange",
    quick: [["ซื้อเมล็ดพันธุ์", "expense"], ["ซื้อต้นกล้า", "expense"], ["ซื้อปุ๋ย", "expense"], ["ขายผัก", "income"]] },
];

export const projectOf = (key: string) => LEDGER_PROJECTS.find((p) => p.key === key);

/** รายการด่วนที่ใช้ได้กับทุกโครงการ */
export const GENERAL_QUICK: [string, LedgerKind][] = [["ซื้อวัสดุอุปกรณ์", "expense"], ["ค่าขนส่ง", "expense"], ["ค่าน้ำ/ค่าไฟ", "expense"], ["ค่าแรง", "expense"], ["เงินสนับสนุน/บริจาค", "income"]];

export const UNITS = ["กก.", "ตัว", "ต้น", "กระสอบ", "ถุง", "กำ", "ชิ้น", "อัน", "ฟอง", "แผง", "ลิตร", "กล่อง", "ขวด", "ลัง", "ใบ", "ห่อ", "แพ็ค"];

export interface LedgerEntry {
  id: string;
  entry_date: string; // YYYY-MM-DD (ค.ศ.)
  project_key: string;
  kind: LedgerKind;
  item: string;
  qty: number | null;
  unit: string | null;
  amount: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
export const todayIso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const monthOfNow = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const TH_MONTHS_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const parts = (iso: string) => { const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? { y: +m[1], m: +m[2], d: +m[3] } : null; };
/** 2026-11-04 → "4 พ.ย. 2569" */
export const thaiDate = (iso: string) => { const p = parts(iso); return p ? `${p.d} ${TH_MONTHS[p.m - 1]} ${p.y + 543}` : iso; };
/** 2026-11 → "พฤศจิกายน 2569" */
export const thaiMonth = (ym: string) => { const m = ym.match(/^(\d{4})-(\d{2})$/); return m ? `${TH_MONTHS_FULL[+m[2] - 1]} ${+m[1] + 543}` : "ทุกเดือน"; };

export const money = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/* ───────── แยกคำพูด → ช่องในฟอร์ม ───────── */

export interface VoiceParse {
  kind?: LedgerKind;
  project?: string;
  item?: string;
  qty?: number;
  unit?: string;
  amount?: number;
}

const THAI_DIGITS = "๐๑๒๓๔๕๖๗๘๙";
const DIGIT_WORD: Record<string, number> = { ศูนย์: 0, หนึ่ง: 1, เอ็ด: 1, สอง: 2, ยี่: 2, สาม: 3, สี่: 4, ห้า: 5, หก: 6, เจ็ด: 7, แปด: 8, เก้า: 9 };
const MULT_WORD: Record<string, number> = { สิบ: 10, ร้อย: 100, พัน: 1000, หมื่น: 10000, แสน: 100000, ล้าน: 1000000 };
const NUM_WORDS = Object.keys(DIGIT_WORD).concat(Object.keys(MULT_WORD)).sort((a, b) => b.length - a.length);
const NUM_RUN = new RegExp(`(?:${NUM_WORDS.join("|")})+(?=\\s*บาท)`, "g");

/** "สองพันห้าร้อย" → 2500 (ใช้เฉพาะคำอ่านตัวเลขที่ตามด้วย "บาท") */
export function thaiWordsToNumber(s: string): number | null {
  let total = 0;
  let cur = 0;
  let i = 0;
  let any = false;
  while (i < s.length) {
    const w = NUM_WORDS.find((x) => s.startsWith(x, i));
    if (!w) return null;
    any = true;
    i += w.length;
    if (w in DIGIT_WORD) cur = DIGIT_WORD[w];
    else {
      const m = MULT_WORD[w];
      if (m === 1000000) { total = (total + (cur || 1)) * m; cur = 0; }
      else { total += (cur || 1) * m; cur = 0; }
    }
  }
  return any ? total + cur : null;
}

const normalizeText = (raw: string) => {
  let t = raw.replace(/[๐-๙]/g, (c) => String(THAI_DIGITS.indexOf(c)));
  t = t.replace(/(\d),(\d{3})/g, "$1$2").replace(/(\d),(\d{3})/g, "$1$2"); // 1,200 → 1200
  t = t.replace(NUM_RUN, (w) => { const n = thaiWordsToNumber(w); return n == null ? w : String(n); });
  return t.replace(/\s+/g, " ").trim();
};

const UNIT_ALIASES: [RegExp, string][] = [
  [/^(กก\.?|กิโลกรัม|กิโล)$/, "กก."],
  [/^กระสอบ$/, "กระสอบ"], [/^ตัว$/, "ตัว"], [/^ต้น$/, "ต้น"], [/^ถุง$/, "ถุง"], [/^กำ$/, "กำ"], [/^ชิ้น$/, "ชิ้น"], [/^อัน$/, "อัน"],
  [/^ฟอง$/, "ฟอง"], [/^แผง$/, "แผง"], [/^ลิตร$/, "ลิตร"], [/^กล่อง$/, "กล่อง"], [/^ขวด$/, "ขวด"], [/^ลัง$/, "ลัง"], [/^ใบ$/, "ใบ"], [/^ห่อ$/, "ห่อ"], [/^(แพ็ค|แพ็ก)$/, "แพ็ค"],
];
const UNIT_RE = "(กก\\.?|กิโลกรัม|กิโล|กระสอบ|ตัว|ต้น|ถุง|กำ|ชิ้น|อัน|ฟอง|แผง|ลิตร|กล่อง|ขวด|ลัง|ใบ|ห่อ|แพ็ค|แพ็ก)";
const unitName = (u: string) => UNIT_ALIASES.find(([re]) => re.test(u))?.[1] ?? u;

/** เดาโครงการจากคำในประโยค (คำเฉพาะเจาะจงก่อน) */
export function guessProject(text: string): string | undefined {
  const t = text.replace(/\s+/g, "");
  const order = ["dragon", "lime", "mulberry", "vine", "boar", "otherveg", "catfish", "frog", "chicken", "veg"];
  for (const k of order) {
    const p = projectOf(k);
    if (p && p.words.some((w) => t.includes(w))) return k;
  }
  return undefined;
}

/**
 * ประโยคที่พูด → ช่องในฟอร์ม · เช่น "ซื้ออาหารปลา 2 กระสอบ 1200 บาท" → รายจ่าย, ปลาดุก, "ซื้ออาหารปลา", 2 กระสอบ, 1200 บาท
 * ช่องที่ฟังไม่พบจะเป็น undefined (ไม่ทับค่าที่กรอกไว้)
 */
export function parseVoice(raw: string): VoiceParse {
  const text = normalizeText(raw);
  const out: VoiceParse = {};
  if (!text) return out;

  const iIncome = text.search(/ขาย|ได้เงิน|รายรับ|รับเงิน|ได้รับ|บริจาค/);
  const iExpense = text.search(/ซื้อ|จ่าย|ค่า|เสีย|รายจ่าย/);
  if (iIncome >= 0 && (iExpense < 0 || iIncome < iExpense)) out.kind = "income";
  else if (iExpense >= 0) out.kind = "expense";

  out.project = guessProject(text);

  let rest = text;
  // จำนวนเงิน: "1200 บาท" / "ราคา 1200" / "เป็นเงิน 1200"
  const baht = rest.match(/(\d+(?:\.\d+)?)\s*บาท/) ?? rest.match(/(?:ราคา|เป็นเงิน|รวม|ทั้งหมด)\s*(\d+(?:\.\d+)?)/);
  if (baht) {
    out.amount = Number(baht[1]);
    rest = rest.replace(baht[0], " ");
  }
  // จำนวน + หน่วย: "2 กระสอบ" "5 กิโล"
  const q = rest.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${UNIT_RE}`));
  if (q) {
    out.qty = Number(q[1]);
    out.unit = unitName(q[2]);
    rest = rest.replace(q[0], " ");
  }
  // เหลือเลขเดียวที่ไม่มีหน่วย: ถือเป็นจำนวนเงินถ้ายังไม่มี
  const nums = rest.match(/\d+(?:\.\d+)?/g) ?? [];
  if (out.amount == null && nums.length >= 1) {
    out.amount = Number(nums[nums.length - 1]);
    rest = rest.replace(new RegExp(`${nums[nums.length - 1]}(?!.*\\d)`), " ");
  }
  const item = rest.replace(/(เป็นเงิน|ราคา|รวม|ทั้งหมด|บาท)/g, " ").replace(/\d+(?:\.\d+)?/g, " ").replace(/\s+/g, " ").trim();
  if (item) out.item = item;
  return out;
}

/* ───────── สรุป ───────── */

export interface ProjectTotal { key: string; income: number; expense: number; net: number; count: number }
export function summarize(entries: LedgerEntry[]): { rows: ProjectTotal[]; income: number; expense: number; net: number } {
  const m = new Map<string, ProjectTotal>();
  for (const p of LEDGER_PROJECTS) m.set(p.key, { key: p.key, income: 0, expense: 0, net: 0, count: 0 });
  for (const e of entries) {
    const r = m.get(e.project_key) ?? { key: e.project_key, income: 0, expense: 0, net: 0, count: 0 };
    if (e.kind === "income") r.income += Number(e.amount); else r.expense += Number(e.amount);
    r.count++;
    m.set(e.project_key, r);
  }
  const rows = [...m.values()].map((r) => ({ ...r, net: r.income - r.expense }));
  const income = rows.reduce((a, r) => a + r.income, 0);
  const expense = rows.reduce((a, r) => a + r.expense, 0);
  return { rows, income, expense, net: income - expense };
}

/** CSV (เปิดใน Excel ได้: ใส่ BOM ตอนดาวน์โหลด) */
export function ledgerCsv(entries: LedgerEntry[]): string {
  const q = (s: string | number | null | undefined) => { const t = String(s ?? ""); return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const rows = [["วันที่", "โครงการ", "ประเภท", "รายการ", "จำนวน", "หน่วย", "จำนวนเงิน (บาท)", "หมายเหตุ"]];
  for (const e of [...entries].sort((a, b) => a.entry_date.localeCompare(b.entry_date) || a.created_at.localeCompare(b.created_at))) {
    rows.push([thaiDate(e.entry_date), projectOf(e.project_key)?.label ?? e.project_key, e.kind === "income" ? "รายรับ" : "รายจ่าย", e.item, e.qty ?? "", e.unit ?? "", e.amount, e.note ?? ""].map(String));
  }
  return rows.map((r) => r.map(q).join(",")).join("\r\n");
}
