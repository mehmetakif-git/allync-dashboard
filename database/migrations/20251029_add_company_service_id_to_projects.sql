-- Migration: Add company_service_id to projects tables
-- Purpose: Link each project to a specific company service instance
-- This allows multiple service instances per company with separate project data

-- =====================================================
-- 1. Add company_service_id to website_projects
-- =====================================================

ALTER TABLE public.website_projects
ADD COLUMN company_service_id uuid;

-- Add foreign key constraint
ALTER TABLE public.website_projects
ADD CONSTRAINT website_projects_company_service_id_fkey
FOREIGN KEY (company_service_id)
REFERENCES public.company_services(id)
ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_website_projects_company_service_id
ON public.website_projects(company_service_id);

-- Add comment
COMMENT ON COLUMN public.website_projects.company_service_id IS
'Links this project to a specific company service instance. Allows multiple website projects per company.';

-- =====================================================
-- 2. Add company_service_id to mobile_app_projects
-- =====================================================

ALTER TABLE public.mobile_app_projects
ADD COLUMN company_service_id uuid;

-- Add foreign key constraint
ALTER TABLE public.mobile_app_projects
ADD CONSTRAINT mobile_app_projects_company_service_id_fkey
FOREIGN KEY (company_service_id)
REFERENCES public.company_services(id)
ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_mobile_app_projects_company_service_id
ON public.mobile_app_projects(company_service_id);

-- Add comment
COMMENT ON COLUMN public.mobile_app_projects.company_service_id IS
'Links this project to a specific company service instance. Allows multiple mobile app projects per company.';

-- =====================================================
-- 3. Data Migration (Optional - if existing data needs to be linked)
-- =====================================================

-- For existing projects, link them to the first active service instance of their type
-- This ensures backward compatibility with existing data

-- Update website_projects
UPDATE public.website_projects wp
SET company_service_id = (
  SELECT cs.id
  FROM public.company_services cs
  INNER JOIN public.service_types st ON cs.service_type_id = st.id
  WHERE cs.company_id = wp.company_id
    AND st.slug = 'website-development'
    AND cs.status = 'active'
  ORDER BY cs.created_at ASC
  LIMIT 1
)
WHERE wp.company_service_id IS NULL;

-- Update mobile_app_projects
UPDATE public.mobile_app_projects map
SET company_service_id = (
  SELECT cs.id
  FROM public.company_services cs
  INNER JOIN public.service_types st ON cs.service_type_id = st.id
  WHERE cs.company_id = map.company_id
    AND st.slug = 'mobile-app-development'
    AND cs.status = 'active'
  ORDER BY cs.created_at ASC
  LIMIT 1
)
WHERE map.company_service_id IS NULL;

-- =====================================================
-- 4. Add NOT NULL constraint (after data migration)
-- =====================================================

-- After ensuring all existing records have company_service_id,
-- make it required for new records
ALTER TABLE public.website_projects
ALTER COLUMN company_service_id SET NOT NULL;

ALTER TABLE public.mobile_app_projects
ALTER COLUMN company_service_id SET NOT NULL;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

/*
-- To rollback this migration:

ALTER TABLE public.website_projects DROP CONSTRAINT IF EXISTS website_projects_company_service_id_fkey;
DROP INDEX IF EXISTS idx_website_projects_company_service_id;
ALTER TABLE public.website_projects DROP COLUMN IF EXISTS company_service_id;

ALTER TABLE public.mobile_app_projects DROP CONSTRAINT IF EXISTS mobile_app_projects_company_service_id_fkey;
DROP INDEX IF EXISTS idx_mobile_app_projects_company_service_id;
ALTER TABLE public.mobile_app_projects DROP COLUMN IF EXISTS company_service_id;
*/
