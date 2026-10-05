import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CardStyle {
  c1: string; // gradient start (border + badge)
  c2: string; // gradient middle (border, shadow, title, tint)
  c3: string; // gradient end
  angle: number; // border gradient angle, degrees
  border: number; // border thickness, px
  shadowBlur: number; // px
  shadowOpacity: number; // 0-100
}

export interface CardStyleGroup {
  id: string;
  label: string;
  entries: { key: string; label: string }[];
}

const style = (c1: string, c2: string, c3: string): CardStyle => ({
  c1, c2, c3, angle: 135, border: 3, shadowBlur: 15, shadowOpacity: 40,
});

const ROSE = style("#fb7185", "#ec4899", "#fb923c");
const EMERALD = style("#34d399", "#22c55e", "#14b8a6");
const SKY = style("#38bdf8", "#3b82f6", "#6366f1");
const AMBER = style("#fbbf24", "#f97316", "#ef4444");
const VIOLET = style("#a78bfa", "#a855f7", "#d946ef");
const CYAN = style("#22d3ee", "#14b8a6", "#10b981");
const RED = style("#fb7185", "#ef4444", "#f97316");

/** Built-in look (what the site had before admins could customise it). */
export const DEFAULT_CARD_STYLES: Record<string, CardStyle> = {
  "media.video": RED,
  "media.image": EMERALD,
  "media.document": SKY,
  "media.website": VIOLET,
  "news.general": SKY,
  "news.academic": VIOLET,
  "news.activity": EMERALD,
  "news.announcement": RED,
  "activity.1": ROSE,
  "activity.2": EMERALD,
  "activity.3": SKY,
  "activity.4": AMBER,
  "activity.5": VIOLET,
  "activity.6": CYAN,
};

export const CARD_STYLE_GROUPS: CardStyleGroup[] = [
  {
    id: "media",
    label: "การ์ดคลังสื่อออนไลน์ (ตามประเภทสื่อ)",
    entries: [
      { key: "media.website", label: "เว็บไซต์" },
      { key: "media.image", label: "รูปภาพ" },
      { key: "media.document", label: "เอกสาร" },
      { key: "media.video", label: "วิดีโอ" },
    ],
  },
  {
    id: "news",
    label: "การ์ดข่าวสาร (ตามหมวดข่าว)",
    entries: [
      { key: "news.general", label: "ทั่วไป" },
      { key: "news.academic", label: "วิชาการ" },
      { key: "news.activity", label: "กิจกรรม" },
      { key: "news.announcement", label: "ประกาศ" },
    ],
  },
  {
    id: "activity",
    label: "การ์ดกิจกรรมโครงการด้วยรักและห่วงใย (สีวนตามลำดับการ์ด)",
    entries: [1, 2, 3, 4, 5, 6].map((n) => ({ key: `activity.${n}`, label: `ใบที่ ${n} (และ ${n + 6}, ${n + 12} ...)` })),
  },
];

const HEX = /^#[0-9a-fA-F]{6}$/;
const clamp = (n: unknown, min: number, max: number, fallback: number) => {
  const v = Number(n);
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
};

/** Saved styles merged over the defaults; invalid values fall back safely. */
export const normalizeCardStyles = (saved: unknown): Record<string, CardStyle> => {
  const out: Record<string, CardStyle> = {};
  const src = (saved && typeof saved === "object" ? saved : {}) as Record<string, Partial<CardStyle>>;
  for (const [key, def] of Object.entries(DEFAULT_CARD_STYLES)) {
    const s = src[key] ?? {};
    out[key] = {
      c1: HEX.test(String(s.c1)) ? String(s.c1) : def.c1,
      c2: HEX.test(String(s.c2)) ? String(s.c2) : def.c2,
      c3: HEX.test(String(s.c3)) ? String(s.c3) : def.c3,
      angle: clamp(s.angle, 0, 360, def.angle),
      border: clamp(s.border, 0, 12, def.border),
      shadowBlur: clamp(s.shadowBlur, 0, 80, def.shadowBlur),
      shadowOpacity: clamp(s.shadowOpacity, 0, 100, def.shadowOpacity),
    };
  }
  return out;
};

const rgba = (hex: string, opacity: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity / 100})`;
};

/** Inline-style pieces for a card built from a CardStyle. */
export const cardParts = (s: CardStyle) => {
  const gradient = `linear-gradient(${s.angle}deg, ${s.c1}, ${s.c2}, ${s.c3})`;
  const button = `linear-gradient(to right, color-mix(in srgb, ${s.c2} 80%, black), color-mix(in srgb, ${s.c3} 80%, black))`;
  return {
    outer: {
      background: gradient,
      padding: s.border,
      boxShadow: s.shadowBlur === 0 || s.shadowOpacity === 0 ? "none" : `0 10px ${s.shadowBlur}px ${rgba(s.c2, s.shadowOpacity)}`,
    } as CSSProperties,
    inner: {
      background: `linear-gradient(to bottom, color-mix(in srgb, ${s.c2} 9%, white), white)`,
      borderRadius: `max(0px, calc(1rem - ${s.border}px))`,
    } as CSSProperties,
    fallback: { background: gradient } as CSSProperties,
    btn: { background: button } as CSSProperties,
    titleStyle: { color: `color-mix(in srgb, ${s.c2} 65%, black)` } as CSSProperties,
    outline: {
      borderColor: `color-mix(in srgb, ${s.c2} 50%, white)`,
      color: `color-mix(in srgb, ${s.c2} 80%, black)`,
    } as CSSProperties,
  };
};

// `card_styles` isn't in the generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cardStylesTable = () => (supabase as any).from("card_styles");

const CACHE_KEY = "card-styles-v1";

const readCache = (): Record<string, CardStyle> => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return normalizeCardStyles(raw ? JSON.parse(raw) : {});
  } catch {
    return normalizeCardStyles({});
  }
};

export const cacheCardStyles = (styles: Record<string, CardStyle>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(styles));
  } catch {
    /* ignore */
  }
};

/** Card styles chosen by the admin (defaults until saved / if unavailable). */
export const useCardStyles = () => {
  const [styles, setStyles] = useState<Record<string, CardStyle>>(readCache);
  useEffect(() => {
    let cancelled = false;
    cardStylesTable()
      .select("styles")
      .eq("id", "main")
      .maybeSingle()
      .then(({ data }: { data: { styles: unknown } | null }) => {
        if (cancelled || !data) return;
        const next = normalizeCardStyles(data.styles);
        setStyles(next);
        cacheCardStyles(next);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return styles;
};
