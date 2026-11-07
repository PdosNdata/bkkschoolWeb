// จำหน้าที่ผู้ใช้ตั้งใจจะเปิด (เช่น /project-ledger จากเมนู LINE) ตอนที่ยังไม่ได้ล็อกอิน
// แล้วพากลับไปหน้านั้นหลังล็อกอินสำเร็จ — ใช้ได้ทั้งอีเมลและ Google เพราะเก็บใน sessionStorage
// ไม่ต้องพึ่ง redirect URL ของ Supabase
const KEY = "bkk-after-login";
const MAX_AGE_MS = 15 * 60 * 1000;

export function rememberAfterLogin(path: string) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ path, t: Date.now() }));
  } catch {
    /* storage ถูกบล็อก → หลังล็อกอินไปแดชบอร์ดตามเดิม */
  }
}

/** คืน path ที่จำไว้ (แล้วลบทิ้ง) — ต้องเป็น path ภายในเว็บและยังไม่หมดอายุ */
export function takeAfterLogin(): string | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const { path, t } = JSON.parse(raw) as { path?: string; t?: number };
    if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
    if (!t || Date.now() - t > MAX_AGE_MS) return null;
    return path;
  } catch {
    return null;
  }
}

export function hasAfterLogin(): boolean {
  try {
    return !!sessionStorage.getItem(KEY);
  } catch {
    return false;
  }
}
