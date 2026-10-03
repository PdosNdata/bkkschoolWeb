// Pure helpers for importing a student list (pasted text or an Excel/CSV
// file). Kept free of Supabase imports so it can be tested on its own.
import type { StudentInput } from "./students";

const PREFIXES = ["เด็กชาย", "เด็กหญิง", "ด.ช.", "ด.ญ.", "ดช.", "ดญ.", "นางสาว", "น.ส.", "นาง", "นาย"];

/** "ม2", "ม.2", "มัธยมศึกษาปีที่ 2", "ป.4" → "ม.2" / "ป.4"; "" if not recognised. */
export function normalizeClass(raw: string): string {
  const t = (raw ?? "")
    .replace(/ประถมศึกษาปีที่/g, "ป.")
    .replace(/มัธยมศึกษาปีที่/g, "ม.")
    .replace(/\s+/g, "");
  const m = t.match(/^([ปม])\.?([1-6])/);
  return m ? `${m[1]}.${m[2]}` : "";
}

/** Room written after the class, e.g. "ม.1/2" or "ป.4-3" → "2" / "3"; "" if none. */
function roomFromClass(raw: string): string {
  const m = (raw ?? "").replace(/\s+/g, "").match(/^[^0-9/-]*[1-6][/-](\d{1,2})$/);
  return m ? m[1] : "";
}

function normalizeGender(raw: string): "ช" | "ญ" | null {
  const t = (raw ?? "").trim();
  if (/^(ช|ชาย|m|male)$/i.test(t)) return "ช";
  if (/^(ญ|หญิง|f|female)$/i.test(t)) return "ญ";
  return null;
}

/** "เด็กชายสมชาย ใจดี" → { prefix, first, last } */
function splitFullName(raw: string): { prefix: string; first: string; last: string } {
  let name = (raw ?? "").trim().replace(/\s+/g, " ");
  let prefix = "";
  for (const p of PREFIXES) {
    if (name.startsWith(p)) {
      prefix = p;
      name = name.slice(p.length).trim();
      break;
    }
  }
  const [first = "", ...rest] = name.split(" ");
  return { prefix, first, last: rest.join(" ") };
}

type Col = "code" | "prefix" | "first" | "last" | "full" | "gender" | "class" | "room";
type ColMap = Partial<Record<Col, number>>;

const POSITIONAL: ColMap = { code: 0, prefix: 1, first: 2, last: 3, gender: 4, class: 5, room: 6 };

/** Recognise a header row by the Thai column titles; null if it isn't one. */
function detectHeader(cells: string[]): ColMap | null {
  const map: ColMap = {};
  cells.forEach((raw, i) => {
    const h = raw.replace(/\s+/g, "");
    let col: Col | null = null;
    if (/ประชาชน|บัตร|โทร|อีเมล|วันเกิด/.test(h)) col = null; // columns we never import
    else if (/^(รหัสนักเรียน|รหัสประจำตัว(นักเรียน)?|รหัสนร\.?|เลขประจำตัว(นักเรียน)?|รหัส)$/.test(h)) col = "code";
    else if (/^(คำนำหน้า(ชื่อ)?|นำหน้า)$/.test(h)) col = "prefix";
    else if (/^(ชื่อ-?สกุล|ชื่อ-?นามสกุล|ชื่อและนามสกุล)$/.test(h)) col = "full";
    else if (/^(ชื่อ|ชื่อจริง|ชื่อตัว)$/.test(h)) col = "first";
    else if (/^(นามสกุล|สกุล)$/.test(h)) col = "last";
    else if (/^เพศ/.test(h)) col = "gender";
    else if (/^(ชั้น|ระดับชั้น|ชั้นเรียน|ชั้นปี)/.test(h)) col = "class";
    else if (/^ห้อง/.test(h)) col = "room";
    if (col && map[col] === undefined) map[col] = i;
  });
  const hits = Object.keys(map).length;
  const hasIdentity = map.code !== undefined || map.first !== undefined || map.full !== undefined;
  return hits >= 2 && hasIdentity ? map : null;
}

function splitLine(line: string): string[] {
  const sep = line.includes("\t") ? "\t" : ",";
  return line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
}

/**
 * Parse pasted text / spreadsheet rows (tab- or comma-separated).
 * With a header row, columns are matched by title in any order; otherwise the
 * order is: รหัสนักเรียน, คำนำหน้า, ชื่อ, นามสกุล, เพศ (ช/ญ), ชั้น, ห้อง.
 */
export function parseStudentRows(text: string): { rows: StudentInput[]; errors: string[]; usedHeader: boolean } {
  const rows: StudentInput[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const firstCells = lines.length ? splitLine(lines[0]) : [];
  const header = detectHeader(firstCells);
  const map = header ?? POSITIONAL;
  const get = (cells: string[], c: Col) => (map[c] === undefined ? "" : (cells[map[c] as number] ?? "").trim());

  lines.forEach((line, i) => {
    if (header && i === 0) return;
    const cells = splitLine(line);
    if (cells.every((c) => c === "")) return;
    const lineNo = i + 1;

    const code = get(cells, "code").replace(/\.0+$/, "");
    let prefix = get(cells, "prefix");
    let first = get(cells, "first");
    let last = get(cells, "last");
    if (map.full !== undefined && !first) {
      const n = splitFullName(get(cells, "full"));
      first = n.first;
      last = last || n.last;
      prefix = prefix || n.prefix;
    }
    const clsRaw = get(cells, "class");
    const klass = normalizeClass(clsRaw);
    const room = get(cells, "room") || roomFromClass(clsRaw);

    if (!code) return void errors.push(`แถว ${lineNo}: ไม่มีรหัสนักเรียน`);
    if (!first) return void errors.push(`แถว ${lineNo}: ไม่มีชื่อ`);
    if (!klass) return void errors.push(`แถว ${lineNo}: ชั้น "${clsRaw}" อ่านไม่ได้ (เช่น ป.4 หรือ ม.1)`);
    if (seen.has(code)) return void errors.push(`แถว ${lineNo}: รหัส ${code} ซ้ำกับแถวก่อนหน้า`);
    seen.add(code);
    rows.push({
      student_code: code,
      prefix: prefix || null,
      first_name: first,
      last_name: last,
      gender: normalizeGender(get(cells, "gender")),
      class_level: klass,
      room: room || null,
    });
  });
  return { rows, errors, usedHeader: !!header };
}

const TEXT_FILE = /\.(csv|tsv|txt)$/i;
const MAX_BYTES = 5 * 1024 * 1024;

/** Thai CSVs saved by older Excel are windows-874, not UTF-8. */
function decodeText(buf: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder("windows-874").decode(buf);
  }
}

/**
 * Read an .xlsx / .xls / .xlsb / .csv file into tab-separated text (first
 * sheet that has data), ready for parseStudentRows.
 */
export async function readSpreadsheetToText(file: File): Promise<{ text: string; sheet: string | null }> {
  if (file.size > MAX_BYTES) throw new Error("ไฟล์ใหญ่เกิน 5 MB");
  const buf = await file.arrayBuffer();
  if (TEXT_FILE.test(file.name)) {
    let text = decodeText(buf);
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip UTF-8 BOM
    if (!text.trim()) throw new Error("ไม่พบข้อมูลในไฟล์");
    return { text, sheet: null };
  }
  const XLSX = await import("xlsx"); // loaded only when someone actually picks a file
  const wb = XLSX.read(buf, { type: "array" });
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, raw: false, defval: "", blankrows: false });
    const lines = rows
      .map((r) => r.map((c) => String(c ?? "").replace(/[\t\r\n]+/g, " ").trim()).join("\t"))
      .filter((l) => l.replace(/\t/g, "") !== "");
    if (lines.length) return { text: lines.join("\n"), sheet: name };
  }
  throw new Error("ไม่พบข้อมูลในไฟล์");
}
