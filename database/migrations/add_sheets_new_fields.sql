-- Migration: Add new fields to sheets_instances table for self-service Google integration
-- Date: 2025-01-18
-- Description: Adds purpose, supported_intents, is_primary, and worksheet_name fields

-- Add purpose field (price_list, product_catalog, stock_tracking, general)
ALTER TABLE "public"."sheets_instances"
ADD COLUMN IF NOT EXISTS "purpose" TEXT DEFAULT 'general';

-- Add supported_intents field (array of intents like price_query, stock_check, product_info)
ALTER TABLE "public"."sheets_instances"
ADD COLUMN IF NOT EXISTS "supported_intents" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add is_primary field (marks this sheet as primary for its intent)
ALTER TABLE "public"."sheets_instances"
ADD COLUMN IF NOT EXISTS "is_primary" BOOLEAN DEFAULT false;

-- Add worksheet_name field (specific worksheet/tab name within the Google Sheet)
ALTER TABLE "public"."sheets_instances"
ADD COLUMN IF NOT EXISTS "worksheet_name" TEXT DEFAULT 'Sheet1';

-- Add google_service_account_email field (for tracking which service account was shared with)
ALTER TABLE "public"."sheets_instances"
ADD COLUMN IF NOT EXISTS "google_service_account_email" TEXT DEFAULT 'allync-bot@allync-platform.iam.gserviceaccount.com';

-- Create index on purpose for faster queries
CREATE INDEX IF NOT EXISTS idx_sheets_instances_purpose ON "public"."sheets_instances"("purpose");

-- Create index on is_primary for faster primary sheet lookups
CREATE INDEX IF NOT EXISTS idx_sheets_instances_is_primary ON "public"."sheets_instances"("is_primary") WHERE "is_primary" = true;

-- Create index on company_id + purpose for intent-based queries
CREATE INDEX IF NOT EXISTS idx_sheets_instances_company_purpose ON "public"."sheets_instances"("company_id", "purpose");

-- Add comment for documentation
COMMENT ON COLUMN "public"."sheets_instances"."purpose" IS 'Purpose of this sheet: price_list, product_catalog, stock_tracking, general';
COMMENT ON COLUMN "public"."sheets_instances"."supported_intents" IS 'Array of AI intents this sheet supports: price_query, stock_check, product_info';
COMMENT ON COLUMN "public"."sheets_instances"."is_primary" IS 'Whether this is the primary sheet for its intent/purpose';
COMMENT ON COLUMN "public"."sheets_instances"."worksheet_name" IS 'Specific worksheet/tab name within the Google Sheet (e.g., Sheet1, Products)';
COMMENT ON COLUMN "public"."sheets_instances"."google_service_account_email" IS 'Service account email that should have access to this sheet';
