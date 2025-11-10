// =====================================================
// Project Media Upload Modal
// =====================================================
// For super admin to upload images/videos per milestone

import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Video, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Milestone {
  id: string;
  name?: string;
  title?: string;
  status: string;
}

interface ProjectMediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectType: 'website' | 'mobile-app';
  companyId: string;
  companyName: string;
  milestones: Milestone[];
  onUploadSuccess: () => void;
}

export default function ProjectMediaUploadModal({
  isOpen,
  onClose,
  projectId,
  projectType,
  companyId,
  companyName,
  milestones,
  onUploadSuccess,
}: ProjectMediaUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB max)
    if (file.size > 52428800) {
      setError('File size must be less than 50MB');
      return;
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const validTypes = [...validImageTypes, ...validVideoTypes];

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV)');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-fill title with filename
    if (!title) {
      setTitle(file.name.split('.')[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!selectedMilestone) {
      setError('Please select a milestone');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${projectType}/${companyId}/${projectId}/${fileName}`;

      console.log('📤 Uploading file to:', filePath);
      setUploadProgress(30);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-media')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded:', uploadData);
      setUploadProgress(60);

      // Get milestone name (try title first, then name)
      const milestone = milestones.find(m => m.id === selectedMilestone);
      const milestoneName = milestone?.title || milestone?.name || '';

      console.log('🏷️ Milestone info:', { milestone, milestoneName });

      // Determine file type
      const fileType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      // Create metadata record
      const { data: metadataData, error: metadataError } = await supabase
        .from('project_media')
        .insert({
          project_id: projectId,
          project_type: projectType,
          company_id: companyId,
          milestone_id: selectedMilestone,
          milestone_name: milestoneName,
          file_path: filePath,
          file_name: selectedFile.name,
          file_type: fileType,
          mime_type: selectedFile.type,
          file_size: selectedFile.size,
          title: title || selectedFile.name,
          description: description || null,
          display_order: displayOrder,
          is_featured: isFeatured,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (metadataError) {
        console.error('❌ Metadata error:', metadataError);
        throw metadataError;
      }

      console.log('✅ Metadata created:', metadataData);
      setUploadProgress(100);
      setSuccess(true);

      // Reset form after 1.5 seconds
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl('');
        setSelectedMilestone('');
        setTitle('');
        setDescription('');
        setDisplayOrder(0);
        setIsFeatured(false);
        setSuccess(false);
        setUploadProgress(0);
        onUploadSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('❌ Upload failed:', err);
      setError(err.message || 'Upload failed. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setPreviewUrl('');
      setSelectedMilestone('');
      setTitle('');
      setDescription('');
      setDisplayOrder(0);
      setIsFeatured(false);
      setError('');
      setSuccess(false);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-card via-primary to-card border-2 border-blue-500/50 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl flex items-center justify-between border-b-2 border-blue-400/50">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload Project Media
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {companyName} • {projectType === 'website' ? 'Website' : 'Mobile App'} Project
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Select File (Image or Video) *
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-3 border-2 border-dashed border-blue-500/50 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-500/5 transition-all cursor-pointer disabled:opacity-50"
              >
                {selectedFile ? (
                  selectedFile.type.startsWith('image/') ? (
                    <ImageIcon className="w-8 h-8 text-blue-400" />
                  ) : (
                    <Video className="w-8 h-8 text-purple-400" />
                  )
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
                <div className="text-center">
                  <p className="text-lg font-medium text-text">
                    {selectedFile ? selectedFile.name : 'Click to select file'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedFile
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • ${selectedFile.type}`
                      : 'Max 50MB • Images (JPEG, PNG, GIF, WebP) or Videos (MP4, WebM, MOV)'}
                  </p>
                </div>
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border-2 border-blue-500/30">
                {selectedFile?.type.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-64 object-cover bg-black"
                  />
                )}
              </div>
            )}
          </div>

          {/* Milestone Selection */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Select Milestone *
            </label>
            <select
              value={selectedMilestone}
              onChange={(e) => setSelectedMilestone(e.target.value)}
              disabled={uploading}
              className="w-full px-4 py-3 bg-secondary border-2 border-blue-500/30 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'rgb(30, 41, 59)',
                color: 'white'
              }}
            >
              <option value="" className="bg-slate-800 text-white">
                -- Select Milestone --
              </option>
              {milestones.map((milestone) => (
                <option
                  key={milestone.id}
                  value={milestone.id}
                  className="bg-slate-800 text-white"
                >
                  {milestone.title || milestone.name} - {milestone.status}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              placeholder="Enter media title (optional)"
              className="w-full px-4 py-3 bg-secondary/50 border-2 border-blue-500/30 rounded-xl text-text focus:outline-none focus:border-blue-400 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              placeholder="Enter media description (optional)"
              rows={3}
              className="w-full px-4 py-3 bg-secondary/50 border-2 border-blue-500/30 rounded-xl text-text focus:outline-none focus:border-blue-400 transition-colors disabled:opacity-50 resize-none"
            />
          </div>

          {/* Display Order & Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                disabled={uploading}
                min={0}
                className="w-full px-4 py-3 bg-secondary/50 border-2 border-blue-500/30 rounded-xl text-text focus:outline-none focus:border-blue-400 transition-colors disabled:opacity-50"
              />
              <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Featured Media
              </label>
              <label className="flex items-center gap-3 px-4 py-3 bg-secondary/50 border-2 border-blue-500/30 rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  disabled={uploading}
                  className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-text text-sm">Mark as featured</span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border-2 border-green-500/50 rounded-xl p-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-400 text-sm font-medium">Upload successful! Closing...</p>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-text">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card/90 backdrop-blur-sm p-6 border-t-2 border-blue-500/30 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-text rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedMilestone || uploading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Media
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
