-- Fix Project Media RLS Policies to use profiles table
-- This migration fixes the RLS policies to use the profiles table instead of auth.users.raw_user_meta_data
-- This ensures consistent permission checking across the application

-- First, drop all existing policies for project_media
DROP POLICY IF EXISTS "super_admin_delete_media" ON public.project_media;
DROP POLICY IF EXISTS "super_admin_insert_media" ON public.project_media;
DROP POLICY IF EXISTS "super_admin_update_media" ON public.project_media;
DROP POLICY IF EXISTS "users_select_media" ON public.project_media;

-- Drop existing storage policies for project-media bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to project-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from project-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow super_admin delete from project-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow super_admin update in project-media" ON storage.objects;

-- Create storage bucket for project media (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-media',
  'project-media',
  false,
  52428800, -- 50MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for project-media bucket

-- Allow authenticated users to upload files to project-media bucket
CREATE POLICY "Allow authenticated uploads to project-media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-media');

-- Allow authenticated users to read files from project-media bucket
CREATE POLICY "Allow authenticated reads from project-media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-media');

-- Allow super admins to delete files from project-media bucket
CREATE POLICY "Allow super_admin delete from project-media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'project-media'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Allow super admins to update files in project-media bucket
CREATE POLICY "Allow super_admin update in project-media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'project-media'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Create new RLS policies for project_media table using profiles table

-- Super admin can insert media
CREATE POLICY "super_admin_insert_media"
ON public.project_media FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Super admin can update media
CREATE POLICY "super_admin_update_media"
ON public.project_media FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Super admin can delete media
CREATE POLICY "super_admin_delete_media"
ON public.project_media FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Users can select media if they are super admin OR if the media belongs to their company
CREATE POLICY "users_select_media"
ON public.project_media FOR SELECT TO authenticated
USING (
  (
    -- Super admins can see all media
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  OR
  (
    -- Company users can see their company's media
    company_id IN (
      SELECT profiles.company_id
      FROM public.profiles
      WHERE profiles.id = auth.uid()
    )
  )
);

-- Verify the policies are working
-- Test query (should return true for super_admin users):
-- SELECT
--   auth.uid() as user_id,
--   (SELECT role FROM profiles WHERE id = auth.uid()) as user_role,
--   EXISTS (
--     SELECT 1 FROM public.profiles
--     WHERE profiles.id = auth.uid()
--     AND profiles.role = 'super_admin'
--   ) as is_super_admin;
