import { supabase } from "@/integrations/supabase/client";

export interface TeacherTraining {
  id: string;
  personnel_id: string | null;
  teacher_name: string;
  report_date: string;
  title: string;
  details: string | null;
  organizer: string | null;
  start_date: string;
  end_date: string | null;
  certificate_url: string | null;
  certificate_name: string | null;
  images: string[] | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// The `teacher_trainings` table isn't in the generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trainingsTable = () => (supabase as any).from("teacher_trainings");

// Certificates reuse the existing public bucket.
export const TRAININGS_BUCKET = "media-files";
export const TRAININGS_PREFIX = "trainings";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

export const formatTrainingDate = fmtDate;

export const formatTrainingRange = (t: Pick<TeacherTraining, "start_date" | "end_date">) =>
  t.end_date && t.end_date !== t.start_date ? `${fmtDate(t.start_date)} ถึง ${fmtDate(t.end_date)}` : fmtDate(t.start_date);

export const trainingPageUrl = (id: string) => `${window.location.origin}/personnel-trainings/${id}`;
