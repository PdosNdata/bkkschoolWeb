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

/**
 * ข้อมูลส่วนบุคคล: หัวคอลัมน์ของไฟล์ส่งออกมาตรฐาน (studentInSchoolList.xlsx) → คอลัมน์ในตาราง student_personal
 * จับคู่ด้วย "ขึ้นต้นด้วย" ชื่อที่ยาวที่สุดก่อน (หัวคอลัมน์ที่มีคำกำกับต่อท้าย เช่น "รหัสโรงเรียน ต้องกรอก" ก็รู้จัก)
 * คอลัมน์ชื่อซ้ำ (ท้ายไฟล์มี จำนวนพี่ชาย/น้องชาย/น้องสาว ซ้ำอีกชุด) ใช้ชุดแรกเท่านั้น
 */
export const PROFILE_HEADERS: [string, string][] = [
  ["รหัสโรงเรียน", "school_code"], ["ชื่อโรงเรียน", "school_name"], ["เลขประจำตัวประชาชน", "national_id"],
  ["ชื่อ(อังกฤษ)", "first_name_en"], ["นามสกุล(อังกฤษ)", "last_name_en"], ["วันเกิด", "birth_date"],
  ["อายุ(ปี)", "age_years"], ["อายุ(เดือน)", "age_months"], ["หมู่โลหิต", "blood_type"],
  ["สัญชาติ", "nationality"], ["เชื้อชาติ", "ethnicity"], ["ศาสนา", "religion"],
  ["จำนวนพี่ชาย", "siblings_older_brothers"], ["จำนวนน้องชาย", "siblings_younger_brothers"],
  ["จำนวนพี่สาว", "siblings_older_sisters"], ["จำนวนน้องสาว", "siblings_younger_sisters"], ["เป็นบุตรคนที่", "child_order"],
  ["สถานภาพสมรสของบิดามารดา", "parents_status"],
  ["หมายเลขบัตรประชาชนบิดา", "father_national_id"], ["คำนำหน้าชื่อบิดา", "father_prefix"], ["ชื่อบิดา", "father_first_name"], ["นามสกุลบิดา", "father_last_name"],
  ["รายได้ต่อเดือนของบิดา", "father_income"], ["หมายเลขโทรศัพท์ของบิดา", "father_phone"], ["อาชีพบิดา", "father_job"],
  ["หมายเลขบัตรประชาชนมารดา", "mother_national_id"], ["คำนำหน้าชื่อมารดา", "mother_prefix"], ["ชื่อมารดา", "mother_first_name"], ["นามสกุลมารดา", "mother_last_name"],
  ["รายได้ต่อเดือนของมารดา", "mother_income"], ["หมายเลขโทรศัพท์ของมารดา", "mother_phone"], ["อาชีพมารดา", "mother_job"],
  ["ความเกี่ยวข้องของผู้ปกครองกับนักเรียน", "guardian_relation"], ["หมายเลขบัตรประชาชนผู้ปกครอง", "guardian_national_id"],
  ["คำนำหน้าชื่อผู้ปกครอง", "guardian_prefix"], ["ชื่อผู้ปกครอง", "guardian_first_name"], ["นามสกุลผู้ปกครอง", "guardian_last_name"],
  ["รายได้ต่อเดือนของผู้ปกครอง", "guardian_income"], ["หมายเลขโทรศัพท์ของผู้ปกครอง", "guardian_phone"], ["อาชีพผู้ปกครอง", "guardian_job"],
  ["รหัสประจำบ้าน(ทะเบียนบ้าน)", "reg_house_code"], ["เลขที่บ้าน(ทะเบียนบ้าน)", "reg_house_no"], ["หมู่(ทะเบียนบ้าน)", "reg_moo"], ["ถนน(ทะเบียนบ้าน)", "reg_road"],
  ["ตำบล(ทะเบียนบ้าน)", "reg_subdistrict"], ["อำเภอ(ทะเบียนบ้าน)", "reg_district"], ["จังหวัด(ทะเบียนบ้าน)", "reg_province"],
  ["รหัสไปรษณีย์(ทะเบียนบ้าน)", "reg_postcode"], ["หมายเลขโทรศัพท์(ทะเบียนบ้าน)", "reg_phone"],
  ["รหัสประจำบ้าน(ที่อยู่ปัจจุบัน)", "cur_house_code"], ["เลขที่บ้าน(ที่อยู่ปัจจุบัน)", "cur_house_no"], ["หมู่(ที่อยู่ปัจจุบัน)", "cur_moo"], ["ถนน(ที่อยู่ปัจจุบัน)", "cur_road"],
  ["ตำบล(ที่อยู่ปัจจุบัน)", "cur_subdistrict"], ["อำเภอ(ที่อยู่ปัจจุบัน)", "cur_district"], ["จังหวัด(ที่อยู่ปัจจุบัน)", "cur_province"],
  ["รหัสไปรษณีย์(ที่อยู่ปัจจุบัน)", "cur_postcode"], ["หมายเลขโทรศัพท์(ที่อยู่ปัจจุบัน)", "cur_phone"],
  ["น้ำหนัก", "weight"], ["ส่วนสูง", "height"], ["ความด้อยโอกาส", "disadvantaged"], ["การพักนอนประจำ", "boarding"],
  ["ขาดแคลนเครื่องแบบ", "lack_uniform"], ["ขาดแคลนเครื่องเขียน", "lack_stationery"], ["ขาดแคลนแบบเรียน", "lack_textbooks"], ["ขาดแคลนอาหารกลางวัน", "lack_lunch"],
  ["ความพิการ", "disability"],
  ["ระยะทางจากบ้านถึงโรงเรียน(ถนนลูกรัง)", "dist_unpaved"], ["ระยะทางจากบ้านถึงโรงเรียน(ถนนลาดยาง)", "dist_paved"], ["ระยะทางจากบ้านถึงโรงเรียน(ทางน้ำ)", "dist_water"],
  ["ระยะเวลาจากบ้านถึงโรงเรียน", "travel_duration"], ["ลักษณะการเดินทางมาโรงเรียน", "travel_mode"], ["ประเภทนักเรียน", "student_type"],
  ["GPAX", "gpax"], ["GPA", "gpa"], ["จังหวัดที่เกิด", "birth_province"], ["เป็นบุตร/ธิดาลำดับที่", "child_order_alt"],
  ["จำนวนพี่น้องที่ศึกษาอยู่", "siblings_studying"], ["รหัสโรงเรียนห้องสาขา", "branch_school_code"], ["ชื่อโรงเรียนห้องสาขา", "branch_school_name"],
];
const PROFILE_BY_LEN = PROFILE_HEADERS.map(([h, c]) => [h.replace(/\s+/g, "").toLowerCase(), c] as const).sort((a, b) => b[0].length - a[0].length);
const profileCol = (h: string): string | null => {
  const t = h.toLowerCase();
  for (const [k, c] of PROFILE_BY_LEN) if (t === k || t.startsWith(k)) return c;
  return null;
};
/** คอลัมน์ที่เป็นเลขยาว/รหัส: ถ้า Excel แปลงเป็นเลขวิทยาศาสตร์ (1.23E+12) ข้อมูลเสียแล้ว ต้องแจ้ง */
const LONG_NUMBER_COLS = new Set(["national_id", "father_national_id", "mother_national_id", "guardian_national_id", "school_code", "branch_school_code",
  "reg_house_code", "cur_house_code", "reg_postcode", "cur_postcode", "father_phone", "mother_phone", "guardian_phone", "reg_phone", "cur_phone"]);
const SCI = /^\d+(\.\d+)?e\+?\d+$/i;

type Col = "code" | "prefix" | "first" | "last" | "full" | "gender" | "class" | "room" | "classNo";
type ColMap = Partial<Record<Col, number>>;
interface HeaderInfo { map: ColMap; profile: { col: string; index: number; header: string }[]; duplicates: string[] }

const POSITIONAL: ColMap = { code: 0, prefix: 1, first: 2, last: 3, gender: 4, class: 5, room: 6, classNo: 7 };

/** Recognise a header row by the Thai column titles; null if it isn't one. */
function detectHeader(cells: string[]): HeaderInfo | null {
  const map: ColMap = {};
  const profile: HeaderInfo["profile"] = [];
  const duplicates: string[] = [];
  const usedProfile = new Set<string>();
  cells.forEach((raw, i) => {
    const h = raw.replace(/\s+/g, "");
    let col: Col | null = null;
    if (/^(รหัสนักเรียน|รหัสประจำตัว(นักเรียน)?|รหัสนร\.?|เลขประจำตัว(นักเรียน)?|รหัส)$/.test(h)) col = "code";
    else if (/^(คำนำหน้า(ชื่อ)?|นำหน้า)$/.test(h)) col = "prefix";
    else if (/^(ชื่อ-?สกุล|ชื่อ-?นามสกุล|ชื่อและนามสกุล)$/.test(h)) col = "full";
    else if (/^(ชื่อ|ชื่อจริง|ชื่อตัว)$/.test(h)) col = "first";
    else if (/^(นามสกุล|สกุล)$/.test(h)) col = "last";
    else if (/^เพศ/.test(h)) col = "gender";
    else if (/^(ชั้น|ระดับชั้น|ชั้นเรียน|ชั้นปี)/.test(h)) col = "class";
    else if (/^ห้อง/.test(h)) col = "room";
    else if (/^เลขที่(ในห้อง|ห้อง)?$/.test(h)) col = "classNo";
    if (col) {
      if (map[col] === undefined) map[col] = i;
      return;
    }
    const pc = profileCol(h);
    if (!pc) return; // คอลัมน์ที่ไม่รู้จัก (เช่น อีเมล) ข้าม
    if (usedProfile.has(pc)) return void duplicates.push(raw.trim());
    usedProfile.add(pc);
    profile.push({ col: pc, index: i, header: raw.trim() });
  });
  const hits = Object.keys(map).length;
  const hasIdentity = map.code !== undefined || map.first !== undefined || map.full !== undefined;
  return hits >= 2 && hasIdentity ? { map, profile, duplicates } : null;
}

function splitLine(line: string): string[] {
  const sep = line.includes("\t") ? "\t" : ",";
  return line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
}

/**
 * Parse pasted text / spreadsheet rows (tab- or comma-separated).
 * With a header row, columns are matched by title in any order; otherwise the
 * order is: รหัสนักเรียน, คำนำหน้า, ชื่อ, นามสกุล, เพศ (ช/ญ), ชั้น, ห้อง, เลขที่.
 */
/** แถวที่นำเข้า: ข้อมูลทะเบียน (StudentInput) + ข้อมูลส่วนบุคคล (profile → ตาราง student_personal) ถ้าไฟล์มีคอลัมน์เหล่านั้น */
export type ImportRow = StudentInput & { profile?: Record<string, string | null> };

export interface ParsedStudents {
  rows: ImportRow[];
  errors: string[];
  /** ข้อความแจ้งให้ทราบ/เตือน (ไม่ทำให้แถวถูกข้าม) */
  warnings: string[];
  usedHeader: boolean;
  /** จำนวนคอลัมน์ข้อมูลส่วนบุคคลที่รู้จักในไฟล์ (0 = ไม่มี) */
  profileColumns: number;
  /** หัวคอลัมน์ซ้ำที่ไม่ได้ใช้ */
  duplicateHeaders: string[];
  /** ไฟล์มีคอลัมน์ "เลขที่" หรือไม่ */
  hasClassNoColumn: boolean;
  /** ใส่เลขที่ให้ตามลำดับแถวในไฟล์ (แยกตามชั้น/ห้อง) เพราะไฟล์ไม่มีคอลัมน์เลขที่ */
  autoNumbered: boolean;
}

export interface ParseOptions {
  /**
   * ไฟล์ไม่มีคอลัมน์ "เลขที่" → ใส่ 1, 2, 3… ตามลำดับแถวในไฟล์ แยกตามชั้น/ห้อง (ค่าเริ่มต้น: ทำ)
   * แถวที่ถูกข้าม (ผิดพลาด) ไม่นับลำดับ
   */
  autoNumber?: boolean;
}

export function parseStudentRows(text: string, opts: ParseOptions = {}): ParsedStudents {
  const autoNumber = opts.autoNumber !== false;
  const groupCount = new Map<string, number>();
  const rows: ImportRow[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const firstCells = lines.length ? splitLine(lines[0]) : [];
  const info = detectHeader(firstCells);
  const header = info !== null;
  const map = info?.map ?? POSITIONAL;
  // มีเลขที่ในไฟล์หรือไม่: มีหัวตาราง = ดูที่หัว; ไม่มีหัวตาราง = ต้องมีค่าในช่องที่ 8 อย่างน้อยหนึ่งแถว
  const classNoPresent = info ? map.classNo !== undefined : lines.some((l) => (splitLine(l)[POSITIONAL.classNo as number] ?? "") !== "");
  const profileCols = info?.profile ?? [];
  // ชุดคีย์ของข้อมูลส่วนบุคคลคงที่ทุกแถว (ช่องว่าง = null) เพื่ออัปโหลดเป็นชุดเดียวกัน ไม่ทำให้บางแถวถูกเขียนทับด้วยค่าว่างโดยไม่ตั้งใจ
  const pc = new Set(profileCols.map((p) => p.col));
  const hasFather = ["father_prefix", "father_first_name", "father_last_name"].some((c) => pc.has(c));
  const hasMother = ["mother_prefix", "mother_first_name", "mother_last_name"].some((c) => pc.has(c));
  const hasGuardian = ["guardian_prefix", "guardian_first_name", "guardian_last_name"].some((c) => pc.has(c));
  const get = (cells: string[], c: Col) => (map[c] === undefined ? "" : (cells[map[c] as number] ?? "").trim());

  lines.forEach((line, i) => {
    if (info && i === 0) return;
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

    const classNoRaw = get(cells, "classNo").replace(/\.0+$/, "");
    let classNo = /^\d{1,3}$/.test(classNoRaw) && Number(classNoRaw) > 0 ? Number(classNoRaw) : 0;
    if (classNoRaw && !classNo) errors.push(`แถว ${lineNo}: เลขที่ "${classNoRaw}" อ่านไม่ได้ (ต้องเป็นตัวเลข) — ข้ามเลขที่ของแถวนี้`);

    if (!code) return void errors.push(`แถว ${lineNo}: ไม่มีรหัสนักเรียน`);
    if (!first) return void errors.push(`แถว ${lineNo}: ไม่มีชื่อ`);
    if (!klass) return void errors.push(`แถว ${lineNo}: ชั้น "${clsRaw}" อ่านไม่ได้ (เช่น ป.4 หรือ ม.1)`);
    if (seen.has(code)) return void errors.push(`แถว ${lineNo}: รหัส ${code} ซ้ำกับแถวก่อนหน้า`);
    seen.add(code);
    if (autoNumber && !classNoPresent) {
      const key = `${klass}|${room}`;
      classNo = (groupCount.get(key) ?? 0) + 1;
      groupCount.set(key, classNo);
    }

    let profile: Record<string, string | null> | undefined;
    if (profileCols.length > 0) {
      profile = {};
      for (const p of profileCols) {
        let v = (cells[p.index] ?? "").trim();
        if (v && LONG_NUMBER_COLS.has(p.col) && SCI.test(v)) {
          warnings.push(`แถว ${lineNo}: "${p.header}" เป็นเลขวิทยาศาสตร์ (${v}) — Excel แปลงตัวเลขยาวเสียแล้ว ให้ตั้งคอลัมน์เป็น "ข้อความ" แล้วบันทึกไฟล์ใหม่ — ข้ามค่านี้`);
          v = "";
        }
        if (v && p.col.endsWith("national_id") && !/^\d{13}$/.test(v.replace(/[\s-]/g, ""))) {
          warnings.push(`แถว ${lineNo}: "${p.header}" ต้องเป็นตัวเลข 13 หลัก — ข้ามค่านี้`);
          v = "";
        } else if (v && p.col.endsWith("national_id")) v = v.replace(/[\s-]/g, "");
        profile[p.col] = v || null;
      }
      // ชื่อของนักเรียน/บิดา/มารดา/ผู้ปกครองรวมเป็นชื่อเต็ม ไว้ใช้พิมพ์ ปพ.5
      const nm = (a: string, b: string, c: string) => [`${profile?.[a] ?? ""}${profile?.[b] ?? ""}`.trim(), profile?.[c] ?? ""].filter(Boolean).join(" ") || null;
      if (hasFather) profile.father_name = nm("father_prefix", "father_first_name", "father_last_name");
      if (hasMother) profile.mother_name = nm("mother_prefix", "mother_first_name", "mother_last_name");
      if (hasGuardian) profile.guardian_name = nm("guardian_prefix", "guardian_first_name", "guardian_last_name");
      profile.prefix = prefix || null;
      profile.first_name = first || null;
      profile.last_name = last || null;
      profile.class_level = klass;
      profile.room = room || null;
    }

    rows.push({
      student_code: code,
      prefix: prefix || null,
      first_name: first,
      last_name: last,
      gender: normalizeGender(get(cells, "gender")),
      class_level: klass,
      room: room || null,
      // เลขที่ is only sent when the file has a usable number, so re-importing
      // a list without that column never wipes numbers already entered
      ...(classNo ? { class_no: classNo } : {}),
      ...(profile ? { profile } : {}),
    });
  });
  return {
    rows, errors, warnings, usedHeader: header, profileColumns: profileCols.length, duplicateHeaders: info?.duplicates ?? [],
    hasClassNoColumn: classNoPresent,
    autoNumbered: autoNumber && !classNoPresent && rows.length > 0,
  };
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
