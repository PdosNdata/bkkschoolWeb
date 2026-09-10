import { supabase } from "@/integrations/supabase/client";

export interface AllowedTeacher {
  email: string;
  full_name: string | null;
  note: string | null;
  created_at: string;
}

// `allowed_teachers` is not in the generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const allowedTeachersTable = () => (supabase as any).from("allowed_teachers");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value: string) => EMAIL_RE.test(value.trim());

/** Split a CSV/paste blob into rows of cells (handles quoted commas). */
export const parseDelimited = (text: string): string[][] => {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else cell += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === "," || c === "\t") {
      row.push(cell); cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else {
      cell += c;
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
};

export interface ParsedTeacher {
  email: string;
  full_name: string;
}

/**
 * Pull { email, full_name } records out of pasted text or a Google Form CSV.
 * Finds the email column by header keyword or by the shape of its values,
 * and a name column by header keyword.
 */
export const extractTeachers = (text: string): ParsedTeacher[] => {
  const rows = parseDelimited(text);
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const looksLikeHeader = !header.some(isEmail);

  const emailKeyword = header.findIndex((h) => /e-?mail|อีเมล|เมล/.test(h));
  const nameKeyword = header.findIndex(
    (h, i) => i !== emailKeyword && /ชื่อ|นามสกุล|name|ครู/.test(h),
  );

  const body = looksLikeHeader ? rows.slice(1) : rows;

  // Fall back: the column whose cells most often look like an email address.
  let emailCol = emailKeyword;
  if (emailCol === -1) {
    const width = Math.max(...rows.map((r) => r.length));
    let best = -1;
    let bestHits = 0;
    for (let c = 0; c < width; c++) {
      const hits = body.filter((r) => isEmail((r[c] ?? ""))).length;
      if (hits > bestHits) { bestHits = hits; best = c; }
    }
    emailCol = best;
  }
  if (emailCol === -1) return [];

  const seen = new Set<string>();
  const out: ParsedTeacher[] = [];
  for (const r of body) {
    const email = (r[emailCol] ?? "").trim().toLowerCase();
    if (!isEmail(email) || seen.has(email)) continue;
    seen.add(email);
    const full_name = nameKeyword >= 0 ? (r[nameKeyword] ?? "").trim() : "";
    out.push({ email, full_name });
  }
  return out;
};
