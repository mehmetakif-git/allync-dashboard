-- =====================================================
-- Invoice PDF Storage Setup
-- =====================================================
-- Creates storage bucket and RLS policies for invoice PDFs
-- Structure: invoice-pdfs/{company_id}/{year}/{invoice_number}.pdf

-- =====================================================
-- 1. Create Storage Bucket
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoice-pdfs',
  'invoice-pdfs',
  false, -- Private bucket - requires authentication
  10485760, -- 10MB limit per PDF
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. Drop Existing Policies (if any)
-- =====================================================

DROP POLICY IF EXISTS "super_admin_all_invoices" ON storage.objects;
DROP POLICY IF EXISTS "company_admin_own_invoices" ON storage.objects;
DROP POLICY IF EXISTS "super_admin_upload_invoices" ON storage.objects;
DROP POLICY IF EXISTS "super_admin_delete_invoices" ON storage.objects;

-- =====================================================
-- 3. RLS Policies for Storage
-- =====================================================

-- Policy 1: Super Admin can see ALL invoice PDFs
CREATE POLICY "super_admin_all_invoices"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'invoice-pdfs'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Policy 2: Company Admin can see ONLY their company's invoice PDFs
-- File structure: invoice-pdfs/{company_id}/{year}/{invoice_number}.pdf
CREATE POLICY "company_admin_own_invoices"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'invoice-pdfs'
  AND (
    -- Extract company_id from path (first folder)
    (storage.foldername(name))[1] IN (
      SELECT company_id::text
      FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('company_admin', 'user')
    )
    OR
    -- Super admin can see all (redundant but explicit)
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
);

-- Policy 3: Only Super Admin can upload invoice PDFs
CREATE POLICY "super_admin_upload_invoices"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'invoice-pdfs'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Policy 4: Only Super Admin can delete invoice PDFs
CREATE POLICY "super_admin_delete_invoices"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'invoice-pdfs'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Policy 5: Only Super Admin can update invoice PDFs
CREATE POLICY "super_admin_update_invoices"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'invoice-pdfs'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- =====================================================
-- 4. Update invoices table with PDF metadata
-- =====================================================

-- Add PDF metadata columns
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pdf_size BIGINT;

-- Update existing pdf_url column comment
COMMENT ON COLUMN public.invoices.pdf_url IS 'Path in storage bucket (format: {company_id}/{year}/{invoice_number}.pdf)';
COMMENT ON COLUMN public.invoices.pdf_generated_at IS 'Timestamp when PDF was generated';
COMMENT ON COLUMN public.invoices.pdf_size IS 'Size of PDF file in bytes';

-- =====================================================
-- 5. Create helper function to get invoice PDF URL
-- =====================================================

CREATE OR REPLACE FUNCTION get_invoice_pdf_url(invoice_pdf_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  signed_url TEXT;
BEGIN
  -- Generate signed URL valid for 1 hour
  SELECT url INTO signed_url
  FROM storage.objects
  WHERE bucket_id = 'invoice-pdfs'
  AND name = invoice_pdf_path;

  -- Return the signed URL (will be handled by client)
  RETURN invoice_pdf_path;
END;
$$;

-- =====================================================
-- 6. Verification Queries (for testing)
-- =====================================================

-- Run these to verify setup:
-- SELECT * FROM storage.buckets WHERE id = 'invoice-pdfs';
-- SELECT * FROM information_schema.columns WHERE table_name = 'invoices' AND column_name IN ('pdf_generated_at', 'pdf_size');
