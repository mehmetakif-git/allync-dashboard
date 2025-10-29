-- Migration: Improve company_services table schema
-- Purpose: Add missing columns, constraints, and indexes for production-ready database

-- =====================================================
-- 1. Add instance_name column (if not exists)
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'company_services'
        AND column_name = 'instance_name'
    ) THEN
        ALTER TABLE public.company_services
        ADD COLUMN instance_name VARCHAR(255);

        COMMENT ON COLUMN public.company_services.instance_name IS
        'User-defined name for this service instance. Allows distinguishing multiple instances of same service type.';
    END IF;
END $$;

-- Set default instance_name for existing records without one
UPDATE public.company_services
SET instance_name = COALESCE(
    instance_name,
    (SELECT name_en FROM service_types WHERE id = service_type_id) || ' Instance'
)
WHERE instance_name IS NULL OR instance_name = '';

-- =====================================================
-- 2. Add UNIQUE constraint for (company_id + instance_name)
-- =====================================================

-- Prevent duplicate instance names within same company
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'company_services_company_instance_name_unique'
    ) THEN
        ALTER TABLE public.company_services
        ADD CONSTRAINT company_services_company_instance_name_unique
        UNIQUE (company_id, instance_name);
    END IF;
END $$;

COMMENT ON CONSTRAINT company_services_company_instance_name_unique ON public.company_services IS
'Ensures each service instance has a unique name within a company. Prevents confusion with multiple instances.';

-- =====================================================
-- 3. Add composite index for better query performance
-- =====================================================

-- Index for queries filtering by company_id and service_type_id
CREATE INDEX IF NOT EXISTS idx_company_services_company_service_type
ON public.company_services(company_id, service_type_id);

-- Index for queries filtering by status
CREATE INDEX IF NOT EXISTS idx_company_services_status
ON public.company_services(status)
WHERE status = 'active';

-- Index for billing date queries
CREATE INDEX IF NOT EXISTS idx_company_services_next_billing
ON public.company_services(next_billing_date)
WHERE next_billing_date IS NOT NULL AND status = 'active';

COMMENT ON INDEX idx_company_services_company_service_type IS
'Improves performance for queries fetching services by company and service type';

-- =====================================================
-- 4. Add CHECK constraints for data validation
-- =====================================================

-- Ensure price_amount is not negative
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'company_services_price_amount_positive'
    ) THEN
        ALTER TABLE public.company_services
        ADD CONSTRAINT company_services_price_amount_positive
        CHECK (price_amount IS NULL OR price_amount >= 0);
    END IF;
END $$;

-- Ensure end_date is after start_date
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'company_services_date_range_valid'
    ) THEN
        ALTER TABLE public.company_services
        ADD CONSTRAINT company_services_date_range_valid
        CHECK (end_date IS NULL OR end_date >= start_date);
    END IF;
END $$;

-- Ensure next_billing_date is in the future or today
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'company_services_next_billing_future'
    ) THEN
        ALTER TABLE public.company_services
        ADD CONSTRAINT company_services_next_billing_future
        CHECK (next_billing_date IS NULL OR next_billing_date >= CURRENT_DATE);
    END IF;
END $$;

-- =====================================================
-- 5. Update foreign key constraints with proper CASCADE
-- =====================================================

-- Drop existing foreign keys if they exist (to recreate with CASCADE)
ALTER TABLE public.company_services
DROP CONSTRAINT IF EXISTS company_services_company_id_fkey;

ALTER TABLE public.company_services
DROP CONSTRAINT IF EXISTS company_services_service_type_id_fkey;

-- Recreate with proper CASCADE behavior
ALTER TABLE public.company_services
ADD CONSTRAINT company_services_company_id_fkey
FOREIGN KEY (company_id)
REFERENCES public.companies(id)
ON DELETE CASCADE  -- When company is deleted, remove all its services
ON UPDATE CASCADE;

ALTER TABLE public.company_services
ADD CONSTRAINT company_services_service_type_id_fkey
FOREIGN KEY (service_type_id)
REFERENCES public.service_types(id)
ON DELETE RESTRICT  -- Prevent deletion of service types that are in use
ON UPDATE CASCADE;

COMMENT ON CONSTRAINT company_services_company_id_fkey ON public.company_services IS
'CASCADE delete: When a company is deleted, all its service instances are automatically removed';

COMMENT ON CONSTRAINT company_services_service_type_id_fkey ON public.company_services IS
'RESTRICT delete: Prevents deletion of service types that are actively used by companies';

-- =====================================================
-- 6. Add trigger to auto-update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_company_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_company_services_updated_at ON public.company_services;

CREATE TRIGGER trigger_company_services_updated_at
    BEFORE UPDATE ON public.company_services
    FOR EACH ROW
    EXECUTE FUNCTION update_company_services_updated_at();

COMMENT ON FUNCTION update_company_services_updated_at() IS
'Automatically updates the updated_at timestamp whenever a record is modified';

-- =====================================================
-- 7. Add helpful views for common queries
-- =====================================================

-- View for active services with full details
CREATE OR REPLACE VIEW active_company_services AS
SELECT
    cs.id,
    cs.company_id,
    c.name as company_name,
    cs.service_type_id,
    st.name_en as service_name,
    st.slug as service_slug,
    cs.instance_name,
    cs.package,
    cs.status,
    cs.price_amount,
    cs.price_currency,
    cs.billing_cycle,
    cs.start_date,
    cs.end_date,
    cs.next_billing_date,
    cs.created_at,
    cs.updated_at
FROM company_services cs
INNER JOIN companies c ON cs.company_id = c.id
INNER JOIN service_types st ON cs.service_type_id = st.id
WHERE cs.status = 'active';

COMMENT ON VIEW active_company_services IS
'Convenient view showing all active services with company and service type details';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check instance_name distribution
SELECT
    'Instance names check' as check_name,
    COUNT(*) as total_services,
    COUNT(DISTINCT instance_name) as unique_names,
    COUNT(*) FILTER (WHERE instance_name IS NULL) as null_names
FROM company_services;

-- Check for potential duplicate instance names within companies
SELECT
    company_id,
    instance_name,
    COUNT(*) as count
FROM company_services
WHERE instance_name IS NOT NULL
GROUP BY company_id, instance_name
HAVING COUNT(*) > 1;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

/*
-- To rollback this migration:

DROP VIEW IF EXISTS active_company_services;
DROP TRIGGER IF EXISTS trigger_company_services_updated_at ON company_services;
DROP FUNCTION IF EXISTS update_company_services_updated_at();

ALTER TABLE company_services DROP CONSTRAINT IF EXISTS company_services_company_instance_name_unique;
ALTER TABLE company_services DROP CONSTRAINT IF EXISTS company_services_price_amount_positive;
ALTER TABLE company_services DROP CONSTRAINT IF EXISTS company_services_date_range_valid;
ALTER TABLE company_services DROP CONSTRAINT IF EXISTS company_services_next_billing_future;

DROP INDEX IF EXISTS idx_company_services_company_service_type;
DROP INDEX IF EXISTS idx_company_services_status;
DROP INDEX IF EXISTS idx_company_services_next_billing;

ALTER TABLE company_services DROP COLUMN IF EXISTS instance_name;
*/
