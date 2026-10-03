import { supabase } from "@/integrations/supabase/client";

// `students` is not in the generated Database types yet, so go through `any`
// (same approach as src/lib/trainings.ts).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const studentsTable = () => (supabase as any).from("students");

export const errMsg = (e: unknown): string =>
  e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e);

export interface Student {
  id: string;
  student_code: string;
  prefix: string | null;
  first_name: string;
  last_name: string;
  gender: "ช" | "ญ" | null;
  class_level: string;
  room: string | null;
  is_active: boolean;
  created_at: string;
}

export type StudentInput = Pick<
  Student,
  "student_code" | "prefix" | "first_name" | "last_name" | "gender" | "class_level" | "room"
> & { is_active?: boolean };

export const CLASS_LEVELS = ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6", "ม.1", "ม.2", "ม.3"];

export const studentFullName = (s: Pick<Student, "prefix" | "first_name" | "last_name">) =>
  `${s.prefix ?? ""}${s.first_name} ${s.last_name ?? ""}`.trim();

export const classLabel = (s: Pick<Student, "class_level" | "room">) =>
  s.room ? `${s.class_level}/${s.room}` : s.class_level;

/** Load every student (the API caps a single response at 1000 rows). */
export async function fetchAllStudents(): Promise<Student[]> {
  const all: Student[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await studentsTable()
      .select("*")
      .order("class_level")
      .order("room")
      .order("student_code")
      .range(from, from + 999);
    if (error) throw error;
    all.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return all;
}

/** "ม2", "ม.2", "มัธยมศึกษาปีที่ 2", "ป.4" → "ม.2" / "ป.4"; "" if not recognised. */
export function normalizeClass(raw: string): string {
  const t = (raw ?? "")
    .replace(/ประถมศึกษาปีที่/g, "ป.")
    .replace(/มัธยมศึกษาปีที่/g, "ม.")
    .replace(/\s+/g, "");
  const m = t.match(/^([ปม])\.?([1-6])/);
  return m ? `${m[1]}.${m[2]}` : "";
}

function normalizeGender(raw: string): "ช" | "ญ" | null {
  const t = (raw ?? "").trim();
  if (/^(ช|ชาย|m|male)$/i.test(t)) return "ช";
  if (/^(ญ|หญิง|f|female)$/i.test(t)) return "ญ";
  return null;
}

/**
 * Parse rows pasted from Excel/CSV. Column order:
 * รหัสนักเรียน, คำนำหน้า, ชื่อ, นามสกุล, เพศ (ช/ญ, เว้นได้), ชั้น, ห้อง (เว้นได้)
 */
export function parseStudentRows(text: string): { rows: StudentInput[]; errors: string[] } {
  const rows: StudentInput[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  lines.forEach((line, i) => {
    const cells = (line.includes("\t") ? line.split("\t") : line.split(",")).map((c) => c.trim().replace(/^"|"$/g, ""));
    if (i === 0 && /รหัส/.test(cells[0] ?? "")) return; // header row
    const [code, prefix, first, last, gender, cls, room] = cells;
    const lineNo = i + 1;
    const klass = normalizeClass(cls ?? "");
    if (!code) return void errors.push(`แถว ${lineNo}: ไม่มีรหัสนักเรียน`);
    if (!first) return void errors.push(`แถว ${lineNo}: ไม่มีชื่อ`);
    if (!klass) return void errors.push(`แถว ${lineNo}: ชั้น "${cls ?? ""}" อ่านไม่ได้ (เช่น ป.4 หรือ ม.1)`);
    if (seen.has(code)) return void errors.push(`แถว ${lineNo}: รหัส ${code} ซ้ำกับแถวก่อนหน้า`);
    seen.add(code);
    rows.push({
      student_code: code,
      prefix: prefix || null,
      first_name: first,
      last_name: last ?? "",
      gender: normalizeGender(gender ?? ""),
      class_level: klass,
      room: room || null,
    });
  });
  return { rows, errors };
}
