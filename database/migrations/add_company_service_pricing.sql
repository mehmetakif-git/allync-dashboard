-- =====================================================
-- Migration: Company Service Pricing
-- Description: Custom pricing per company for each service package
-- Date: 2025-01-28
-- =====================================================

-- Create company_service_pricing table
CREATE TABLE IF NOT EXISTS company_service_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Relations
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  service_type_id UUID NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,

  -- Package type (basic, standard, premium)
  package TEXT NOT NULL CHECK (package IN ('basic', 'standard', 'premium')),

  -- Pricing details
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  period TEXT NOT NULL DEFAULT 'month' CHECK (period IN ('month', 'year', 'one-time')),

  -- Optional custom features for this company (JSONB arrays)
  custom_features_en TEXT[],
  custom_features_tr TEXT[],
  custom_limits JSONB DEFAULT '{}'::jsonb,

  -- Notes for this specific pricing (internal use)
  notes TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one pricing per company-service-package combination
  CONSTRAINT unique_company_service_package UNIQUE(company_id, service_type_id, package)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_service_pricing_company
  ON company_service_pricing(company_id);

CREATE INDEX IF NOT EXISTS idx_company_service_pricing_service
  ON company_service_pricing(service_type_id);

CREATE INDEX IF NOT EXISTS idx_company_service_pricing_active
  ON company_service_pricing(is_active)
  WHERE is_active = true;

-- Comments for documentation
COMMENT ON TABLE company_service_pricing IS 'Custom pricing per company for each service package. Overrides default pricing from service_types.';
COMMENT ON COLUMN company_service_pricing.package IS 'Package tier: basic, standard, or premium';
COMMENT ON COLUMN company_service_pricing.period IS 'Billing period: month, year, or one-time (for website/mobile app dev)';
COMMENT ON COLUMN company_service_pricing.custom_features_en IS 'Custom features specific to this company (English)';
COMMENT ON COLUMN company_service_pricing.custom_features_tr IS 'Custom features specific to this company (Turkish)';
COMMENT ON COLUMN company_service_pricing.custom_limits IS 'Custom limits/quotas as JSON (e.g., {"max_users": 100, "storage_gb": 50})';
COMMENT ON COLUMN company_service_pricing.notes IS 'Internal notes for Super Admin (not shown to company)';

-- =====================================================
-- Add payment_type to service_types (for one-time services)
-- =====================================================

-- Add payment_type column to service_types if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_types' AND column_name = 'payment_type'
  ) THEN
    ALTER TABLE service_types
    ADD COLUMN payment_type TEXT DEFAULT 'recurring'
    CHECK (payment_type IN ('recurring', 'one-time'));

    COMMENT ON COLUMN service_types.payment_type IS 'Payment type: recurring (monthly/yearly) or one-time (website/mobile dev)';
  END IF;
END $$;

-- Update specific services to one-time
UPDATE service_types
SET payment_type = 'one-time'
WHERE slug IN ('website-development', 'mobile-app-development')
  AND payment_type != 'one-time';

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE company_service_pricing ENABLE ROW LEVEL SECURITY;

-- Super Admin: Full access
CREATE POLICY "Super admins have full access to company_service_pricing"
  ON company_service_pricing
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Company Admin: Can only view their own company's pricing
CREATE POLICY "Company admins can view their own pricing"
  ON company_service_pricing
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      JOIN profiles ON profiles.user_id = auth.users.id
      WHERE auth.uid() = auth.users.id
      AND profiles.company_id = company_service_pricing.company_id
      AND profiles.role = 'company_admin'
      AND company_service_pricing.is_active = true
    )
  );

-- =====================================================
-- Helper Function: Get Company Custom Pricing
-- =====================================================

CREATE OR REPLACE FUNCTION get_company_service_pricing(
  p_company_id UUID,
  p_service_type_id UUID
)
RETURNS TABLE (
  package TEXT,
  price DECIMAL,
  currency TEXT,
  period TEXT,
  features_en TEXT[],
  features_tr TEXT[],
  limits JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    csp.package,
    csp.price,
    csp.currency,
    csp.period,
    csp.custom_features_en,
    csp.custom_features_tr,
    csp.custom_limits
  FROM company_service_pricing csp
  WHERE csp.company_id = p_company_id
    AND csp.service_type_id = p_service_type_id
    AND csp.is_active = true
  ORDER BY
    CASE csp.package
      WHEN 'basic' THEN 1
      WHEN 'standard' THEN 2
      WHEN 'premium' THEN 3
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_company_service_pricing IS 'Get custom pricing for a specific company and service. Returns empty if no custom pricing exists.';

-- =====================================================
-- Updated_at Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION update_company_service_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_company_service_pricing_updated_at
  BEFORE UPDATE ON company_service_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_company_service_pricing_updated_at();

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- Uncomment to insert sample custom pricing
-- INSERT INTO company_service_pricing (company_id, service_type_id, package, price, currency, period, custom_features_en, notes)
-- VALUES
--   ('company-uuid-here', 'service-uuid-here', 'basic', 299.99, 'USD', 'month',
--    ARRAY['Custom feature 1', 'Custom feature 2'],
--    'Special pricing for VIP client');
