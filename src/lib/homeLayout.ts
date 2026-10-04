import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_LAYOUT, normalizeLayout, type LayoutEntry } from "@/components/home/homeSections";

// `home_layout` isn't in the generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const homeLayoutTable = () => (supabase as any).from("home_layout");

/** Order/visibility of home page sections; falls back to the default if unavailable. */
const CACHE_KEY = "home-layout-v1";

const readCache = (): LayoutEntry[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? normalizeLayout(JSON.parse(raw)) : DEFAULT_LAYOUT;
  } catch {
    return DEFAULT_LAYOUT;
  }
};

export const cacheLayout = (layout: LayoutEntry[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(layout));
  } catch {
    /* ignore */
  }
};

export const useHomeLayout = () => {
  // Start from the last layout this browser saw so the page does not reshuffle on load
  const [layout, setLayout] = useState<LayoutEntry[]>(readCache);
  useEffect(() => {
    let cancelled = false;
    homeLayoutTable()
      .select("sections")
      .eq("id", "main")
      .maybeSingle()
      .then(({ data }: { data: { sections: unknown } | null }) => {
        if (cancelled || !data) return;
        const next = normalizeLayout(data.sections);
        setLayout(next);
        cacheLayout(next);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return layout;
};
