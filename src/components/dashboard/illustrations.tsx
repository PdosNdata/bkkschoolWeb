/* eslint-disable react-refresh/only-export-components -- static artwork: components plus a lookup table in one file */
import type { ReactNode } from "react";

// Flat illustrations for the dashboard cards (160 x 120 viewBox, drawn in the
// card's own palette through the CSS variables set on the card:
//   --c-deep / --c-deep2 (vivid), --c-to (soft), --c-ink (dark)).
// Purely decorative → aria-hidden.

const D = { fill: "var(--c-deep)" };
const D2 = { fill: "var(--c-deep2)" };
const S = { fill: "var(--c-to)" };
const INK = { fill: "var(--c-ink)" };
const STROKE_D = { stroke: "var(--c-deep)", fill: "none" };
const STROKE_D2 = { stroke: "var(--c-deep2)", fill: "none" };

// soft backdrop shared by every scene
const Backdrop = () => (
  <>
    <circle cx="112" cy="78" r="50" style={D} opacity=".13" />
    <circle cx="40" cy="34" r="16" style={D} opacity=".1" />
    <circle cx="146" cy="22" r="7" style={D2} opacity=".18" />
  </>
);

const Scene = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true" focusable="false">
    <Backdrop />
    {children}
  </svg>
);

const Spark = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0-7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2Z" fill="#fff" opacity=".95" />
);

// ── ระบบตรวจการมาเรียน: open book + check ───────────────────────────
const Attendance = () => (
  <Scene>
    <path d="M26 96 L26 44 Q54 36 80 50 L80 102 Q54 90 26 96Z" fill="#fff" />
    <path d="M134 96 L134 44 Q106 36 80 50 L80 102 Q106 90 134 96Z" style={S} />
    <path d="M80 50 V102" stroke="var(--c-deep2)" strokeWidth="2.5" fill="none" />
    {[0, 1, 2].map((i) => <rect key={i} x="36" y={58 + i * 10} width={30 - i * 4} height="4" rx="2" style={D} opacity=".35" />)}
    {[0, 1, 2].map((i) => <rect key={i} x="94" y={58 + i * 10} width={32 - i * 5} height="4" rx="2" fill="#fff" opacity=".8" />)}
    <circle cx="118" cy="34" r="17" style={D} />
    <circle cx="118" cy="34" r="17" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
    <path d="M109 34 l6 6 l12 -13" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Spark x={26} y={30} s={0.9} />
  </Scene>
);

// ── ระบบงานพัสดุ: stacked boxes ─────────────────────────────────────
const Supplies = () => (
  <Scene>
    <rect x="28" y="66" width="56" height="40" rx="5" fill="#fff" />
    <rect x="28" y="66" width="56" height="11" rx="5" style={D2} />
    <rect x="51" y="66" width="10" height="40" style={D} opacity=".85" />
    <rect x="86" y="46" width="48" height="60" rx="5" style={S} />
    <rect x="86" y="46" width="48" height="12" rx="5" style={D} />
    <rect x="106" y="46" width="9" height="60" style={D2} opacity=".7" />
    <rect x="54" y="36" width="38" height="30" rx="5" fill="#fff" />
    <rect x="54" y="36" width="38" height="9" rx="4" style={D} />
    <rect x="70" y="36" width="7" height="30" style={D2} opacity=".7" />
    <Spark x={134} y={30} s={0.9} />
  </Scene>
);

// ── ระบบกิจการนักเรียน: graduation cap ──────────────────────────────
const StudentAffairs = () => (
  <Scene>
    <path d="M46 64 v22 q34 18 68 0 v-22 l-34 16z" style={D2} />
    <polygon points="80,28 134,52 80,76 26,52" style={D} />
    <polygon points="80,28 134,52 80,76 26,52" fill="#fff" opacity=".18" />
    <path d="M80 28 L134 52" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
    <path d="M128 55 v30" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <circle cx="128" cy="90" r="6" fill="#fff" />
    <path d="M122 92 l-2 12 M128 96 v12 M134 92 l2 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    <Spark x={30} y={30} />
    <Spark x={142} y={18} s={0.7} />
  </Scene>
);

// ── โครงการด้วยรักและห่วงใย: heart ──────────────────────────────────
const Care = () => (
  <Scene>
    <path d="M80 100 C36 72 32 40 56 36 C70 34 78 44 80 50 C82 44 90 34 104 36 C128 40 124 72 80 100Z" style={D} />
    <path d="M80 100 C36 72 32 40 56 36 C70 34 78 44 80 50 C82 44 90 34 104 36 C128 40 124 72 80 100Z" fill="#fff" opacity=".12" />
    <ellipse cx="60" cy="52" rx="9" ry="6" transform="rotate(-35 60 52)" fill="#fff" opacity=".6" />
    <path d="M122 28 c-6 -7 -15 0 -9 7 l9 8 l9 -8 c6 -7 -3 -14 -9 -7z" style={D2} />
    <path d="M32 92 c-4 -5 -11 0 -7 5 l7 6 l7 -6 c4 -5 -3 -10 -7 -5z" style={S} />
    <Spark x={142} y={64} s={0.8} />
  </Scene>
);

// ── กิจกรรมทั้งหมด: calendar ────────────────────────────────────────
const Activities = () => (
  <Scene>
    <rect x="34" y="30" width="92" height="76" rx="9" fill="#fff" />
    <path d="M34 39 a9 9 0 0 1 9 -9 h74 a9 9 0 0 1 9 9 v14 h-92z" style={D} />
    <rect x="52" y="22" width="7" height="18" rx="3.5" style={D2} />
    <rect x="101" y="22" width="7" height="18" rx="3.5" style={D2} />
    {[0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => (
      <circle key={`${c}${r}`} cx={50 + c * 20} cy={66 + r * 14} r="4.5" style={(c + r * 4) % 5 === 1 ? D : S} opacity={(c + r * 4) % 5 === 1 ? 1 : 0.8} />
    )))}
    <circle cx="110" cy="94" r="12" style={D2} />
    <path d="M104 94 l5 5 l9 -10" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Scene>
);

// ── ประชาสัมพันธ์: megaphone ────────────────────────────────────────
const PublicRelations = () => (
  <Scene>
    <path d="M30 56 L92 28 V92 L30 70Z" style={D} />
    <path d="M30 56 L92 28 V92 L30 70Z" fill="#fff" opacity=".14" />
    <rect x="18" y="54" width="18" height="18" rx="5" style={D2} />
    <path d="M44 74 l8 28 q2 6 8 4 l4 -1 q5 -2 3 -8 l-6 -18z" style={D2} />
    <rect x="90" y="26" width="9" height="68" rx="4.5" style={D2} />
    <path d="M110 46 q10 14 0 28" stroke="var(--c-deep)" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M122 36 q18 24 0 48" stroke="var(--c-deep)" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".6" />
    <Spark x={136} y={26} s={0.8} />
  </Scene>
);

// ── คลังสื่อออนไลน์: video player ──────────────────────────────────
const Media = () => (
  <Scene>
    <rect x="50" y="26" width="84" height="58" rx="9" style={S} transform="rotate(6 92 55)" />
    <rect x="30" y="34" width="92" height="64" rx="9" fill="#fff" />
    <rect x="30" y="34" width="92" height="12" rx="9" style={D2} />
    {[0, 1, 2].map((i) => <circle key={i} cx={40 + i * 9} cy="40" r="2.3" fill="#fff" opacity=".85" />)}
    <circle cx="76" cy="72" r="19" style={D} />
    <path d="M70 62 L89 72 L70 82Z" fill="#fff" />
    <rect x="40" y="90" width="52" height="4" rx="2" style={S} />
    <rect x="40" y="90" width="26" height="4" rx="2" style={D} />
    <Spark x={136} y={30} s={0.9} />
  </Scene>
);

// ── อัพโหลดเอกสาร: document + upload arrow ─────────────────────────
const Upload = () => (
  <Scene>
    <path d="M42 24 h46 l22 22 v62 a6 6 0 0 1 -6 6 h-62 a6 6 0 0 1 -6 -6 v-78 a6 6 0 0 1 6 -6z" fill="#fff" />
    <path d="M88 24 l22 22 h-16 a6 6 0 0 1 -6 -6z" style={S} />
    {[0, 1, 2].map((i) => <rect key={i} x="52" y={60 + i * 11} width={44 - i * 8} height="5" rx="2.5" style={D} opacity=".35" />)}
    <circle cx="112" cy="88" r="20" style={D} />
    <circle cx="112" cy="88" r="20" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
    <path d="M112 98 V78 M103 86 l9 -9 l9 9" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Scene>
);

// ── ระบบบุคลากร: three people ──────────────────────────────────────
const Person = ({ x, y, s, main }: { x: number; y: number; s: number; main?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx="0" cy="-22" r="13" style={main ? D : D2} />
    <path d="M-24 22 q0 -30 24 -30 q24 0 24 30z" style={main ? D : D2} />
    <circle cx="0" cy="-22" r="13" fill="#fff" opacity=".18" />
  </g>
);
const Personnel = () => (
  <Scene>
    <Person x={42} y={82} s={0.78} />
    <Person x={118} y={82} s={0.78} />
    <Person x={80} y={92} s={1.1} main />
    <circle cx="116" cy="34" r="14" style={D} />
    <path d="M109 34 l5 5 l10 -11" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Scene>
);

// ── ข้อมูลนักเรียน: ID card ────────────────────────────────────────
const Students = () => (
  <Scene>
    <path d="M70 18 h20 v16 h-20z" style={D2} opacity=".7" />
    <rect x="30" y="34" width="100" height="70" rx="10" fill="#fff" />
    <path d="M30 44 a10 10 0 0 1 10 -10 h80 a10 10 0 0 1 10 10 v8 h-100z" style={D} />
    <circle cx="56" cy="76" r="12" style={D2} />
    <path d="M36 102 q0 -16 20 -16 q20 0 20 16z" style={D2} />
    <circle cx="56" cy="76" r="12" fill="#fff" opacity=".15" />
    {[0, 1, 2].map((i) => <rect key={i} x="86" y={66 + i * 11} width={34 - i * 7} height="5" rx="2.5" style={D} opacity=".4" />)}
    <Spark x={136} y={28} s={0.9} />
  </Scene>
);

// ── ระบบตรวจคำตอบปรนัย: answer sheet ───────────────────────────────
const Omr = () => (
  <Scene>
    <rect x="42" y="16" width="76" height="92" rx="8" fill="#fff" />
    {[48, 112].map((x) => [24, 100].map((y) => <rect key={`${x}${y}`} x={x - 6} y={y - 4} width="8" height="8" rx="1.5" style={INK} opacity=".75" />))}
    {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => {
      const filled = (r + c * 3) % 4 === 1;
      return <circle key={`${r}${c}`} cx={56 + c * 15} cy={36 + r * 17} r="5.2" style={filled ? D : { fill: "none" }} stroke={filled ? "none" : "var(--c-deep)"} strokeWidth="1.6" opacity={filled ? 1 : 0.55} />;
    }))}
    <circle cx="118" cy="88" r="18" style={D2} />
    <circle cx="118" cy="88" r="18" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
    <path d="M109 88 l7 7 l12 -14" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Scene>
);

// ── ปพ.5 ปพ.6 ออนไลน์: grade sheet + grade badge ───────────────────
const Pp5 = () => (
  <Scene>
    <rect x="34" y="16" width="80" height="92" rx="8" fill="#fff" />
    <rect x="34" y="16" width="80" height="16" rx="8" style={D} />
    {[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x="44" y={42 + i * 13} width="26" height="5" rx="2.5" style={D} opacity=".4" /><rect x="76" y={42 + i * 13} width="28" height="5" rx="2.5" style={D} opacity=".22" /></g>)}
    <circle cx="116" cy="88" r="19" style={D2} />
    <circle cx="116" cy="88" r="19" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
    <text x="116" y="97" textAnchor="middle" fontSize="26" fontWeight="800" fill="#fff">4</text>
  </Scene>
);

// ── นำเข้าข้อมูลครู: person + arrow into tray ──────────────────────
const TeacherImport = () => (
  <Scene>
    <circle cx="64" cy="40" r="15" style={D} />
    <path d="M36 82 q0 -30 28 -30 q28 0 28 30z" style={D} />
    <circle cx="64" cy="40" r="15" fill="#fff" opacity=".18" />
    <rect x="30" y="92" width="100" height="14" rx="7" fill="#fff" />
    <path d="M30 99 h100" style={STROKE_D2} strokeWidth="2" opacity=".4" />
    <circle cx="118" cy="52" r="18" style={D2} />
    <circle cx="118" cy="52" r="18" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
    <path d="M118 42 V62 M109 54 l9 9 l9 -9" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Scene>
);

// ── จัดการสิทธิ์เมนู: shield + lock ────────────────────────────────
const Permissions = () => (
  <Scene>
    <path d="M80 18 L124 34 V64 C124 88 104 102 80 110 C56 102 36 88 36 64 V34Z" style={D} />
    <path d="M80 18 L124 34 V64 C124 88 104 102 80 110 C56 102 36 88 36 64 V34Z" fill="#fff" opacity=".12" />
    <path d="M80 18 V110 C56 102 36 88 36 64 V34Z" fill="#fff" opacity=".1" />
    <rect x="64" y="58" width="32" height="26" rx="6" fill="#fff" />
    <path d="M70 58 v-8 a10 10 0 0 1 20 0 v8" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="80" cy="69" r="4" style={D2} />
    <rect x="78" y="70" width="4" height="9" rx="2" style={D2} />
    <Spark x={134} y={30} s={0.9} />
  </Scene>
);

// ── ระบบหนังสือเรียน: stack of books ───────────────────────────────
const Textbooks = () => (
  <Scene>
    <rect x="26" y="82" width="104" height="22" rx="5" style={D2} />
    <rect x="30" y="86" width="94" height="14" rx="3" fill="#fff" opacity=".9" />
    <rect x="34" y="56" width="92" height="24" rx="5" style={D} />
    <rect x="38" y="60" width="84" height="16" rx="3" fill="#fff" opacity=".9" />
    <rect x="82" y="34" width="22" height="24" rx="3" style={S} transform="rotate(-8 93 46)" />
    <rect x="46" y="32" width="34" height="24" rx="5" style={D2} />
    <rect x="50" y="36" width="26" height="16" rx="3" fill="#fff" opacity=".9" />
    <rect x="40" y="70" width="6" height="8" rx="1" style={D2} opacity=".5" />
    <path d="M130 42 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z" fill="#fff" opacity=".95" />
  </Scene>
);

// ── จัดการสไลด์หน้าแรก: framed picture carousel ────────────────────
const Slider = () => (
  <Scene>
    <rect x="46" y="26" width="86" height="60" rx="9" style={S} transform="rotate(5 89 56)" />
    <rect x="28" y="30" width="92" height="64" rx="9" fill="#fff" />
    <rect x="34" y="36" width="80" height="52" rx="6" style={S} />
    <circle cx="94" cy="52" r="8" style={D} />
    <path d="M34 88 L60 58 L78 78 L90 66 L114 88Z" style={D2} />
    <path d="M60 58 L78 78 L34 88Z" fill="#fff" opacity=".18" />
    {[0, 1, 2].map((i) => <circle key={i} cx={64 + i * 12} cy="106" r={i === 1 ? 4 : 3} style={i === 1 ? D2 : D} opacity={i === 1 ? 1 : 0.4} />)}
    <path d="M20 62 l-8 8 l8 8" stroke="var(--c-deep2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".6" />
    <path d="M132 62 l8 8 l-8 8" stroke="var(--c-deep2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".6" />
  </Scene>
);

// ── Admin: gear ────────────────────────────────────────────────────
const Admin = () => (
  <Scene>
    <g transform="translate(80 62)">
      {[0, 45, 90, 135].map((a) => <rect key={a} x="-8" y="-44" width="16" height="88" rx="5" style={D2} transform={`rotate(${a})`} />)}
      <circle r="34" style={D} />
      <circle r="34" fill="#fff" opacity=".12" />
      <circle r="15" fill="#fff" />
      <circle r="6" style={D2} />
    </g>
    <circle cx="124" cy="96" r="13" style={S} />
    <path d="M118 96 l4 4 l8 -9" stroke="var(--c-deep2)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Spark x={30} y={92} s={0.8} />
  </Scene>
);

const Generic = () => (
  <Scene>
    <rect x="40" y="30" width="80" height="60" rx="10" fill="#fff" />
    <rect x="40" y="30" width="80" height="14" rx="10" style={D} />
    {[0, 1, 2].map((i) => <rect key={i} x="52" y={56 + i * 11} width={52 - i * 10} height="5" rx="2.5" style={D} opacity=".35" />)}
  </Scene>
);

export const ILLUSTRATIONS: Record<string, () => JSX.Element> = {
  attendance_system: Attendance,
  supplies_system: Supplies,
  student_affairs: StudentAffairs,
  internal_activities: Care,
  all_activities: Activities,
  public_relations: PublicRelations,
  media_library: Media,
  document_upload: Upload,
  personnel_system: Personnel,
  students_system: Students,
  omr_system: Omr,
  pp5_system: Pp5,
  teacher_import: TeacherImport,
  menu_permissions: Permissions,
  textbook_system: Textbooks,
  home_slider: Slider,
  admin_panel: Admin,
};

export const illustrationFor = (key?: string): (() => JSX.Element) => (key && ILLUSTRATIONS[key]) || Generic;
