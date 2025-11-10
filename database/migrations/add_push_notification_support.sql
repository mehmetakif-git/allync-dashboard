-- =====================================================
-- Push Notification Support Migration
-- =====================================================
-- Description: Add push notification support to profiles table
-- Date: 2025-01-10
-- =====================================================

-- Add push notification fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS push_token TEXT,
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS push_platform TEXT CHECK (push_platform IN ('ios', 'android', 'web'));

-- Add comment for documentation
COMMENT ON COLUMN profiles.push_token IS 'Expo push token for mobile notifications';
COMMENT ON COLUMN profiles.push_enabled IS 'Whether user has enabled push notifications';
COMMENT ON COLUMN profiles.push_platform IS 'Platform type: ios, android, or web';

-- Create index for faster lookups (only index non-null tokens)
CREATE INDEX IF NOT EXISTS idx_profiles_push_token
ON profiles(push_token)
WHERE push_token IS NOT NULL AND push_enabled = true;

-- Create push notifications log table for tracking
CREATE TABLE IF NOT EXISTS push_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES system_notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'error')),
  error_message TEXT,
  ticket_id TEXT, -- Expo push ticket ID
  receipt_id TEXT, -- Expo push receipt ID
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE push_notifications_log IS 'Tracks push notification delivery status';
COMMENT ON COLUMN push_notifications_log.ticket_id IS 'Expo push notification ticket ID';
COMMENT ON COLUMN push_notifications_log.receipt_id IS 'Expo push notification receipt ID';
COMMENT ON COLUMN push_notifications_log.status IS 'Status: pending, sent, delivered, failed, error';

-- Create indexes for push_notifications_log
CREATE INDEX IF NOT EXISTS idx_push_log_notification_id ON push_notifications_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_push_log_user_id ON push_notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_push_log_status ON push_notifications_log(status);
CREATE INDEX IF NOT EXISTS idx_push_log_sent_at ON push_notifications_log(sent_at DESC);

-- Create updated_at trigger for push_notifications_log
CREATE OR REPLACE FUNCTION update_push_notifications_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_notifications_log_updated_at
BEFORE UPDATE ON push_notifications_log
FOR EACH ROW
EXECUTE FUNCTION update_push_notifications_log_updated_at();

-- Grant permissions (adjust based on your RLS policies)
ALTER TABLE push_notifications_log ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can view all push logs
CREATE POLICY push_logs_super_admin_select ON push_notifications_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Policy: Users can view their own push logs
CREATE POLICY push_logs_user_select ON push_notifications_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: System can insert push logs (for backend service)
CREATE POLICY push_logs_system_insert ON push_notifications_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: System can update push logs
CREATE POLICY push_logs_system_update ON push_notifications_log
FOR UPDATE
TO authenticated
USING (true);

-- =====================================================
-- Verification Queries (Run these to verify)
-- =====================================================

-- Check if columns were added
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
-- AND column_name IN ('push_token', 'push_enabled', 'push_platform');

-- Check if indexes were created
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('profiles', 'push_notifications_log');

-- Check if push_notifications_log table exists
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_name = 'push_notifications_log';
