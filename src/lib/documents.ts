import { supabase } from "@/integrations/supabase/client";

export const DOCUMENT_TYPES = [
  "แผนการจัดการการเรียนรู้",
  "นวัตกรรมการเรียนรู้",
  "หลักสูตรโรงเรียน",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export interface SchoolDocument {
  id: string;
  title: string;
  doc_date: string;
  doc_type: DocumentType;
  file_url: string;
  file_name: string;
  file_type: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

// The `documents` table isn't in the generated Supabase types yet, so this
// helper keeps the `as any` cast in one place.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const documentsTable = () => (supabase as any).from("documents");

export const DOCUMENTS_BUCKET = "media-files";
export const DOCUMENTS_PREFIX = "documents";
