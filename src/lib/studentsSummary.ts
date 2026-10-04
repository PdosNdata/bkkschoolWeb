// Head-count of students per class (หญิง / ชาย / รวม) with subtotals.
// Pure functions (no Supabase imports) so they can be tested on their own.
import type { Student } from "./students";

export interface SummaryRow {
  label: string;
  female: number;
  male: number;
  total: number;
  kind: "class" | "subtotal" | "grand";
}

export interface StudentSummary {
  rows: SummaryRow[];
  /** active students with no recorded gender (counted in รวม only) */
  noGender: number;
  /** active students whose class is not one of the rows (not counted anywhere) */
  otherClass: number;
}

const PRIMARY = ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"];
const SECONDARY = ["ม.1", "ม.2", "ม.3"];

/** Only students marked กำลังศึกษา (is_active) are counted. */
export function summarizeByClass(students: Pick<Student, "class_level" | "gender" | "is_active">[]): StudentSummary {
  const active = students.filter((s) => s.is_active);
  const count = (level: string): SummaryRow => {
    const inClass = active.filter((s) => s.class_level === level);
    return {
      label: level,
      female: inClass.filter((s) => s.gender === "ญ").length,
      male: inClass.filter((s) => s.gender === "ช").length,
      total: inClass.length,
      kind: "class",
    };
  };
  const sum = (label: string, list: SummaryRow[], kind: SummaryRow["kind"]): SummaryRow => ({
    label,
    female: list.reduce((a, r) => a + r.female, 0),
    male: list.reduce((a, r) => a + r.male, 0),
    total: list.reduce((a, r) => a + r.total, 0),
    kind,
  });

  const pri = PRIMARY.map(count);
  const sec = SECONDARY.map(count);
  const known = new Set([...PRIMARY, ...SECONDARY]);
  const counted = active.filter((s) => known.has(s.class_level));

  return {
    rows: [...pri, sum("รวมประถม", pri, "subtotal"), ...sec, sum("รวมมัธยม", sec, "subtotal"), sum("รวมทั้งหมด", [...pri, ...sec], "grand")],
    noGender: counted.filter((s) => s.gender !== "ช" && s.gender !== "ญ").length,
    otherClass: active.length - counted.length,
  };
}

/** Tab-separated text: paste straight into Excel / Google Sheets. */
export function summaryToTsv(rows: SummaryRow[]): string {
  return ["ชั้น\tหญิง\tชาย\tรวม", ...rows.map((r) => `${r.label}\t${r.female}\t${r.male}\t${r.total}`)].join("\n");
}

/** A small standalone HTML page for printing (labels/numbers only, nothing user-typed). */
export function summaryToPrintHtml(rows: SummaryRow[], schoolName: string, asOf: string): string {
  const body = rows.map((r) => `<tr class="${r.kind}"><td>${r.label}</td><td>${r.female}</td><td>${r.male}</td><td>${r.total}</td></tr>`).join("");
  return `<!doctype html><html lang="th"><head><meta charset="utf-8"><title>สรุปจำนวนนักเรียน</title><style>
@page{size:A4;margin:18mm}
body{font-family:"TH Sarabun New","Sarabun",Tahoma,sans-serif;font-size:20px;color:#000}
h1{font-size:28px;margin:0 0 4px;text-align:center}p{margin:0 0 14px;text-align:center}
table{border-collapse:collapse;margin:0 auto;min-width:60%}
th,td{border:1px solid #000;padding:4px 14px;text-align:center}th:first-child,td:first-child{text-align:left}
th{background:#eee}tr.subtotal td{font-weight:700;background:#f3f3f3}tr.grand td{font-weight:700;background:#e3e3e3}
</style></head><body><h1>สรุปจำนวนนักเรียน</h1><p>${schoolName} — ข้อมูล ณ วันที่ ${asOf}</p>
<table><thead><tr><th>ชั้น</th><th>หญิง</th><th>ชาย</th><th>รวม</th></tr></thead><tbody>${body}</tbody></table></body></html>`;
}
