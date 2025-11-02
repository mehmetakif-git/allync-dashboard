-- Add auto-suspend related columns to invoices table
-- These columns control automatic service suspension for overdue invoices

-- Add auto_suspend_on_overdue column (default true for manual invoices)
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS auto_suspend_on_overdue BOOLEAN DEFAULT true;

-- Add is_manual column to distinguish manual vs automated invoices
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT false;

-- Add suspended_at column to track when service was suspended
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Add comments for clarity
COMMENT ON COLUMN public.invoices.auto_suspend_on_overdue IS 'Whether to automatically suspend service when invoice becomes overdue';
COMMENT ON COLUMN public.invoices.is_manual IS 'Whether this invoice was created manually by admin';
COMMENT ON COLUMN public.invoices.suspended_at IS 'Timestamp when service was suspended due to overdue invoice';

-- Create index for efficient overdue invoice queries
CREATE INDEX IF NOT EXISTS idx_invoices_overdue_suspension
ON public.invoices (status, due_date, auto_suspend_on_overdue)
WHERE auto_suspend_on_overdue = true AND status != 'paid';

-- Update existing invoices to have auto_suspend_on_overdue = true
UPDATE public.invoices
SET auto_suspend_on_overdue = true
WHERE auto_suspend_on_overdue IS NULL;
