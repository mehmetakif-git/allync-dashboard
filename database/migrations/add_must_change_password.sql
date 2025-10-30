-- Migration: Add must_change_password column to profiles table
-- Purpose: Track users who need to change temporary passwords
-- Date: 2025-10-30

-- Add column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN profiles.must_change_password IS 'Flag indicating user must change password on next login (for temporary passwords)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_must_change_password
ON profiles(must_change_password)
WHERE must_change_password = true;

-- Update existing invited users (if any) - Optional
-- UPDATE profiles SET must_change_password = false WHERE must_change_password IS NULL;

COMMIT;
