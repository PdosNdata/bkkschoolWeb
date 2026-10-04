import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { themeFor } from "@/lib/dashboardThemes";
import { illustrationFor } from "./illustrations";

// Optional uploaded artwork: /dashboard/manifest.json maps a card key to an image
// file in /public/dashboard (see README.txt there). Cards without an entry — or
// whose image fails to load — keep the built-in illustration.
type ArtManifest = Record<string, string>;
let manifestPromise: Promise<ArtManifest> | null = null;
const loadManifest = (): Promise<ArtManifest> => {
  manifestPromise ??= fetch("/dashboard/manifest.json", { cache: "no-cache" })
    .then((r) => (r.ok ? (r.json() as Promise<ArtManifest>) : {}))
    .catch(() => ({}));
  return manifestPromise;
};
const safeFile = (name?: string) => (name && /^[\w.\- ]+(\?v=\w+)?$/.test(name) ? name : null);

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  /** the card's permissionName — picks its colour theme and illustration */
  themeKey?: string;
  href: string;
  /** static page under /public (needs a real page load, not the SPA router) */
  external?: boolean;
  index: number;
}

// A dimensional dashboard card: pastel gradient face, glossy icon tile, an
// illustration, layered coloured shadows, a gentle 3D tilt that follows the
// pointer and an entrance animation. All styling lives in index.css (.dash-*);
// colours come from CSS variables set per card from its theme.
const DashboardCard = ({ title, description, icon: Icon, themeKey, href, external, index }: DashboardCardProps) => {
  const faceRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useRef(typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const theme = themeFor(themeKey);
  const Illustration = illustrationFor(themeKey);

  const [artFile, setArtFile] = useState<string | null>(null);
  const [artBroken, setArtBroken] = useState(false);
  useEffect(() => {
    let alive = true;
    loadManifest().then((m) => alive && setArtFile(safeFile(themeKey ? m[themeKey] : undefined)));
    return () => {
      alive = false;
    };
  }, [themeKey]);

  const vars = {
    "--c-from": theme.from,
    "--c-to": theme.to,
    "--c-deep": theme.deep,
    "--c-deep2": theme.deep2,
    "--c-ink": theme.ink,
    "--c-glow": theme.glow,
    animationDelay: `${Math.min(index, 12) * 45}ms`,
  } as CSSProperties;

  const onMove = (e: MouseEvent) => {
    const el = faceRef.current;
    if (!el || reduceMotion.current) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--px", String((x - 0.5) * 2));
    el.style.setProperty("--py", String((y - 0.5) * 2));
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const onLeave = () => {
    const el = faceRef.current;
    if (!el) return;
    el.style.setProperty("--px", "0");
    el.style.setProperty("--py", "0");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "20%");
  };

  const body = (
    <div ref={faceRef} className="dash-card-face">
      <div className="dash-card-glare" />
      <div className="dash-card-art" aria-hidden="true">
        {artFile && !artBroken ? (
          <img
            src={`/dashboard/${artFile}`}
            alt=""
            loading="lazy"
            draggable={false}
            className="h-full w-full object-contain object-right-bottom"
            onError={() => setArtBroken(true)}
          />
        ) : (
          <Illustration />
        )}
      </div>
      <div className="relative z-10 max-w-[66%]">
        <div className="dash-tile">
          <Icon className="relative z-10 h-7 w-7 drop-shadow-sm" strokeWidth={2.2} />
        </div>
        <h3 className="mt-4 text-lg font-bold leading-snug" style={{ color: "var(--c-ink)" }}>
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--c-ink)", opacity: 0.72 }}>
          {description}
        </p>
        <span className="dash-cta">
          เข้าใช้งาน <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </div>
  );

  const cls = "dash-card group block rounded-[26px] outline-none focus-visible:ring-4 focus-visible:ring-offset-2";
  return external ? (
    <a href={href} className={cls} style={vars} onMouseMove={onMove} onMouseLeave={onLeave}>
      {body}
    </a>
  ) : (
    <Link to={href} className={cls} style={vars} onMouseMove={onMove} onMouseLeave={onLeave}>
      {body}
    </Link>
  );
};

export default DashboardCard;
