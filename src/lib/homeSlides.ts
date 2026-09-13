import { supabase } from "@/integrations/supabase/client";

export interface HomeSlide {
  id: string;
  image_url: string;
  title: string;
  description: string | null;
  link: string | null;
  display_order: number;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// The `home_slides` table isn't in the generated Supabase types yet, so this
// helper keeps the `as any` cast in one place.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const homeSlidesTable = () => (supabase as any).from("home_slides");

export const HOME_SLIDES_BUCKET = "news-images";
export const HOME_SLIDES_PREFIX = "home-slides";
