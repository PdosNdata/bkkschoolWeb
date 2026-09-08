-- Document uploads: teaching plans, learning innovations, school curriculum.
-- Files themselves live in the existing public "media-files" storage bucket
-- under the "documents/" prefix; this table only stores their metadata.

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  doc_date date NOT NULL DEFAULT current_date,
  doc_type text NOT NULL CHECK (doc_type IN (
    'แผนการจัดการการเรียนรู้',
    'นวัตกรรมการเรียนรู้',
    'หลักสูตรโรงเรียน'
  )),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  uploaded_by text NOT NULL,
  user_id uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Public listing on /documents
DROP POLICY IF EXISTS "Documents are publicly readable" ON public.documents;
CREATE POLICY "Documents are publicly readable"
  ON public.documents FOR SELECT
  USING (true);

-- Only approved admins/teachers can add, edit or remove documents
DROP POLICY IF EXISTS "Staff can insert documents" ON public.documents;
CREATE POLICY "Staff can insert documents"
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'teacher') AND approved = true
  ));

DROP POLICY IF EXISTS "Staff can update documents" ON public.documents;
CREATE POLICY "Staff can update documents"
  ON public.documents FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'teacher') AND approved = true
  ));

DROP POLICY IF EXISTS "Staff can delete documents" ON public.documents;
CREATE POLICY "Staff can delete documents"
  ON public.documents FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'teacher') AND approved = true
  ));

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS documents_created_at_idx ON public.documents (created_at DESC);
CREATE INDEX IF NOT EXISTS documents_doc_type_idx ON public.documents (doc_type);
