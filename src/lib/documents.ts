import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Built-in types, used until the `document_types` table is available and as
// a fallback if it can't be read.
export const DOCUMENT_TYPES = [
  "แผนการจัดการการเรียนรู้",
  "นวัตกรรมการเรียนรู้",
  "หลักสูตรโรงเรียน",
] as const;

export type DocumentType = string;

export interface SchoolDocument {
  id: string;
  title: string;
  doc_date: string;
  doc_type: DocumentType;
  file_url: string;
  file_name: string;
  file_type: string | null;
  uploaded_by: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// The `documents` table isn't in the generated Supabase types yet, so this
// helper keeps the `as any` cast in one place.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const documentsTable = () => (supabase as any).from("documents");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const documentTypesTable = () => (supabase as any).from("document_types");

export const DOCUMENTS_BUCKET = "media-files";
export const DOCUMENTS_PREFIX = "documents";

/** Document types managed in the DB (falls back to the built-in three). */
export const useDocumentTypes = () => {
  const [types, setTypes] = useState<string[]>([...DOCUMENT_TYPES]);

  const reload = useCallback(async () => {
    const { data, error } = await documentTypesTable()
      .select("name")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (!error && data && data.length > 0) {
      setTypes((data as { name: string }[]).map((r) => r.name));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /** Adds a type; resolves to the (trimmed) name, or throws on failure. */
  const addType = useCallback(
    async (rawName: string) => {
      const name = rawName.trim();
      if (!name) throw new Error("กรุณากรอกชื่อประเภท");
      if (types.includes(name)) return name;
      const { error } = await documentTypesTable().insert({
        name,
        display_order: types.length + 1,
      });
      if (error) throw error;
      await reload();
      return name;
    },
    [types, reload],
  );

  return { types, addType, reload };
};
