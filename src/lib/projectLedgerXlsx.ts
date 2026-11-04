// ส่งออกบันทึกบัญชีกิจกรรมเกษตรเพื่ออาหารกลางวันเป็นไฟล์ Excel จัดรูปแบบพร้อมพิมพ์ (A4 แนวตั้ง) — โหลด exceljs เมื่อกดส่งออกเท่านั้น
import { projectOf, summarize, thaiDate, todayIso, type LedgerEntry } from "./projectLedger";

const FONT = "TH Sarabun New";
const GREEN = "FF047857";
const GREEN_SOFT = "FFD1FAE5";
const GRAY_SOFT = "FFF3F4F6";
const MONEY = "#,##0.00;[Red]-#,##0.00";

/** สีพื้นอ่อนประจำโครงการ (ใช้ในแผ่นสรุป) */
const TINT: Record<string, string> = {
  sky: "FFE0F2FE", emerald: "FFD1FAE5", amber: "FFFEF3C7", stone: "FFE7E5E4", green: "FFDCFCE7",
  lime: "FFECFCCB", teal: "FFCCFBF1", pink: "FFFCE7F3", violet: "FFEDE9FE", orange: "FFFFEDD5", indigo: "FFE0E7FF", rose: "FFFFE4E6", cyan: "FFCFFAFE",
};

export interface LedgerXlsxOptions { monthLabel: string; monthKey: string; projectKey: string; school?: string }

export async function exportLedgerXlsx(entries: LedgerEntry[], opt: LedgerXlsxOptions): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const school = opt.school ?? "โรงเรียนบ้านค้อดอนแคน";
  const scope = `${opt.monthLabel} · ${opt.projectKey ? `โครงการ${projectOf(opt.projectKey)?.label ?? ""}` : "ทุกโครงการ"}`;
  const sum = summarize(entries);
  const sorted = [...entries].sort((a, b) => a.entry_date.localeCompare(b.entry_date) || a.created_at.localeCompare(b.created_at));

  const wb = new ExcelJS.Workbook();
  wb.creator = school;
  wb.created = new Date();

  const thin = { style: "thin" as const, color: { argb: "FF9CA3AF" } };
  const box = { top: thin, left: thin, bottom: thin, right: thin };
  const setup = (ws: import("exceljs").Worksheet, titleRows?: [number, number]) => {
    ws.pageSetup = {
      paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
      margins: { left: 0.4, right: 0.4, top: 0.55, bottom: 0.6, header: 0.25, footer: 0.3 },
      ...(titleRows ? { printTitlesRow: `${titleRows[0]}:${titleRows[1]}` } : {}),
    };
    ws.headerFooter.oddFooter = `&L&"${FONT}"บันทึกบัญชีกิจกรรมเกษตรเพื่ออาหารกลางวัน · ${school}&R&"${FONT}"หน้า &P / &N`;
    ws.views = [{ showGridLines: false }];
  };
  const head = (row: import("exceljs").Row, fill = GREEN) => {
    row.height = 26;
    row.eachCell((c) => {
      c.font = { name: FONT, size: 14, bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      c.border = box;
    });
  };
  const banner = (ws: import("exceljs").Worksheet, cols: number, lines: [string, number, boolean][]) => {
    lines.forEach(([text, size, bold], i) => {
      const r = i + 1;
      ws.mergeCells(r, 1, r, cols);
      const c = ws.getCell(r, 1);
      c.value = text;
      c.font = { name: FONT, size, bold, color: { argb: i === 0 ? "FFFFFFFF" : "FF065F46" } };
      c.alignment = { horizontal: "center", vertical: "middle" };
      if (i === 0) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN } };
      ws.getRow(r).height = i === 0 ? 34 : 22;
    });
  };

  /* ───────── แผ่น 1: สรุป ───────── */
  const s1 = wb.addWorksheet("สรุป");
  s1.columns = [{ width: 34 }, { width: 14 }, { width: 18 }, { width: 18 }, { width: 18 }];
  setup(s1);
  banner(s1, 5, [["รายงานสรุปบันทึกบัญชีกิจกรรมเกษตรเพื่ออาหารกลางวัน", 22, true], [school, 16, true], [`ช่วงเวลา: ${scope}`, 14, false], [`พิมพ์เมื่อ ${thaiDate(todayIso())}`, 12, false]]);
  s1.addRow([]);
  const h1 = s1.addRow(["โครงการ", "จำนวนรายการ", "รายรับ (บาท)", "รายจ่าย (บาท)", "คงเหลือ (บาท)"]);
  head(h1);
  const rows = sum.rows.filter((r) => r.count > 0);
  rows.forEach((r, i) => {
    const p = projectOf(r.key);
    const row = s1.addRow([p?.label ?? r.key, r.count, r.income, r.expense, r.net]);
    row.height = 24;
    row.eachCell((c, n) => {
      c.font = { name: FONT, size: 14, bold: n === 1 || n === 5, color: n === 5 && r.net < 0 ? { argb: "FFB91C1C" } : undefined };
      c.border = box;
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: n === 1 ? (TINT[p?.hue ?? "stone"] ?? GRAY_SOFT) : i % 2 ? GRAY_SOFT : "FFFFFFFF" } };
      c.alignment = { vertical: "middle", horizontal: n === 1 ? "left" : n === 2 ? "center" : "right", indent: n === 1 ? 1 : 0 };
      if (n >= 3) c.numFmt = MONEY;
    });
  });
  const tot = s1.addRow(["รวมทั้งหมด", entries.length, sum.income, sum.expense, sum.net]);
  tot.height = 28;
  tot.eachCell((c, n) => {
    c.font = { name: FONT, size: 15, bold: true, color: n === 5 && sum.net < 0 ? { argb: "FFB91C1C" } : { argb: "FF065F46" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_SOFT } };
    c.border = { top: { style: "double", color: { argb: GREEN } }, left: thin, right: thin, bottom: { style: "medium", color: { argb: GREEN } } };
    c.alignment = { vertical: "middle", horizontal: n === 1 ? "left" : n === 2 ? "center" : "right", indent: n === 1 ? 1 : 0 };
    if (n >= 3) c.numFmt = MONEY;
  });
  s1.addRow([]);
  const verdict = s1.addRow([sum.net >= 0 ? `ภาพรวม: กำไร ${Math.abs(sum.net).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท` : `ภาพรวม: ขาดทุน ${Math.abs(sum.net).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`]);
  s1.mergeCells(verdict.number, 1, verdict.number, 5);
  verdict.getCell(1).font = { name: FONT, size: 15, bold: true, color: { argb: sum.net >= 0 ? "FF047857" : "FFB91C1C" } };
  verdict.getCell(1).alignment = { horizontal: "center" };
  s1.addRow([]);
  s1.addRow([]);
  const sig = s1.addRow(["ลงชื่อ ……………………………… ผู้จัดทำ", "", "", "ลงชื่อ ……………………………… ผู้อำนวยการโรงเรียน", ""]);
  const sig2 = s1.addRow(["( ……………………………… )", "", "", "( ……………………………… )", ""]);
  for (const r of [sig, sig2]) {
    s1.mergeCells(r.number, 1, r.number, 2);
    s1.mergeCells(r.number, 4, r.number, 5);
    for (const n of [1, 4]) { r.getCell(n).font = { name: FONT, size: 14 }; r.getCell(n).alignment = { horizontal: "center" }; }
  }

  /* ───────── แผ่น 2: รายการรายวัน ───────── */
  const s2 = wb.addWorksheet("รายการรายวัน");
  s2.columns = [{ width: 14 }, { width: 22 }, { width: 34 }, { width: 14 }, { width: 15 }, { width: 15 }, { width: 24 }];
  setup(s2, [5, 5]);
  banner(s2, 7, [["รายการรายรับ-รายจ่ายรายวัน", 20, true], [`${school} · บันทึกบัญชีกิจกรรมเกษตรเพื่ออาหารกลางวัน`, 14, true], [`ช่วงเวลา: ${scope}`, 13, false]]);
  s2.addRow([]);
  head(s2.addRow(["วันที่", "โครงการ", "รายการ", "จำนวน", "รายรับ (บาท)", "รายจ่าย (บาท)", "หมายเหตุ"]));
  sorted.forEach((e, i) => {
    const row = s2.addRow([
      thaiDate(e.entry_date), projectOf(e.project_key)?.short ?? e.project_key, e.item,
      e.qty != null ? `${e.qty} ${e.unit ?? ""}`.trim() : "", e.kind === "income" ? Number(e.amount) : null, e.kind === "expense" ? Number(e.amount) : null, e.note ?? "",
    ]);
    row.height = 22;
    row.eachCell({ includeEmpty: true }, (c, n) => {
      c.font = { name: FONT, size: 13, color: n === 5 ? { argb: "FF047857" } : n === 6 ? { argb: "FFB91C1C" } : undefined, bold: n === 5 || n === 6 };
      c.border = box;
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: i % 2 ? GRAY_SOFT : "FFFFFFFF" } };
      c.alignment = { vertical: "middle", horizontal: n === 4 ? "center" : n >= 5 && n <= 6 ? "right" : "left", wrapText: n === 3 || n === 7 };
      if (n === 5 || n === 6) c.numFmt = MONEY;
    });
  });
  const t2 = s2.addRow(["รวม", "", "", "", sum.income, sum.expense, ""]);
  t2.height = 26;
  t2.eachCell({ includeEmpty: true }, (c, n) => {
    c.font = { name: FONT, size: 14, bold: true, color: { argb: "FF065F46" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_SOFT } };
    c.border = { top: { style: "double", color: { argb: GREEN } }, left: thin, right: thin, bottom: { style: "medium", color: { argb: GREEN } } };
    c.alignment = { vertical: "middle", horizontal: n >= 5 && n <= 6 ? "right" : "left" };
    if (n === 5 || n === 6) c.numFmt = MONEY;
  });
  s2.mergeCells(t2.number, 1, t2.number, 4);
  s2.views = [{ showGridLines: false, state: "frozen", ySplit: 5 }];

  const buf = await wb.xlsx.writeBuffer();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  a.download = `บันทึกบัญชีกิจกรรมเกษตรเพื่ออาหารกลางวัน-${opt.monthKey}${opt.projectKey ? "-" + (projectOf(opt.projectKey)?.short ?? opt.projectKey) : ""}.xlsx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

