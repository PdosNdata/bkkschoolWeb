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

export { normalizeClass, parseStudentRows, readSpreadsheetToText } from "./studentsImport";
