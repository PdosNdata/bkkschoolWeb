-- Let staff add their own document types (previously a hardcoded CHECK list).
-- Existing documents keep their doc_type text as-is.

CREATE TABLE IF NOT EXISTS public.document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  user_id uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Document types are publicly readable" ON public.document_types;
CREATE POLICY "Document types are publicly readable"
  ON public.document_types FOR SELECT
  USING (true);

-- Any approved teacher/admin can add a type; only admins can rename/remove.
DROP POLICY IF EXISTS "Staff can add document types" ON public.document_types;
CREATE POLICY "Staff can add document types"
  ON public.document_types FOR INSERT
  WITH CHECK (public.can_access_dashboard());

DROP POLICY IF EXISTS "Admins can update document types" ON public.document_types;
CREATE POLICY "Admins can update document types"
  ON public.document_types FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete document types" ON public.document_types;
CREATE POLICY "Admins can delete document types"
  ON public.document_types FOR DELETE
  USING (public.is_admin());

INSERT INTO public.document_types (name, display_order) VALUES
  ('แผนการจัดการการเรียนรู้', 1),
  ('นวัตกรรมการเรียนรู้', 2),
  ('หลักสูตรโรงเรียน', 3)
ON CONFLICT (name) DO NOTHING;

-- Free-form types: drop the hardcoded 3-value CHECK on documents.doc_type.
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_doc_type_check;
