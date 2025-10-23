// =====================================================
// SUPPORT TICKET FILE ATTACHMENTS
// =====================================================

import { supabase } from '../supabase';

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
}

const STORAGE_BUCKET = 'support-ticket-attachments';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

// =====================================================
// FILE UPLOAD FUNCTIONS
// =====================================================

// Validate file before upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Allowed types: images, PDF, Word, Excel, text files',
    };
  }

  return { valid: true };
}

// Upload file to Supabase Storage
export async function uploadTicketAttachment(
  ticketId: string,
  file: File
): Promise<FileAttachment> {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${ticketId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  try {
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    const attachment: FileAttachment = {
      id: fileName,
      name: file.name,
      url: urlData.publicUrl,
      size: file.size,
      type: file.type,
      uploaded_at: new Date().toISOString(),
    };

    return attachment;
  } catch (error) {
    console.error('Error uploading ticket attachment:', error);
    throw error;
  }
}

// Upload multiple files
export async function uploadMultipleAttachments(
  ticketId: string,
  files: File[]
): Promise<FileAttachment[]> {
  const uploadPromises = files.map((file) => uploadTicketAttachment(ticketId, file));
  return Promise.all(uploadPromises);
}

// Delete file from storage
export async function deleteTicketAttachment(fileId: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileId]);

    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting ticket attachment:', error);
    throw error;
  }
}

// Delete multiple files
export async function deleteMultipleAttachments(fileIds: string[]): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(fileIds);

    if (error) {
      console.error('Error deleting files:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting ticket attachments:', error);
    throw error;
  }
}

// Get file download URL
export async function getAttachmentDownloadUrl(fileId: string): Promise<string> {
  try {
    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(fileId, 3600); // 1 hour expiry

    if (!data?.signedUrl) {
      throw new Error('Failed to generate download URL');
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Get file icon based on type
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.startsWith('text/')) return '📃';
  return '📎';
}

// =====================================================
// STORAGE SETUP (Run once to create bucket)
// =====================================================

// Create storage bucket for ticket attachments
export async function setupTicketAttachmentsStorage() {
  try {
    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ALLOWED_FILE_TYPES,
      });

      if (error) {
        console.error('Error creating bucket:', error);
        throw error;
      }

      console.log('✅ Storage bucket created:', STORAGE_BUCKET);
    } else {
      console.log('✅ Storage bucket already exists:', STORAGE_BUCKET);
    }
  } catch (error) {
    console.error('Error setting up storage:', error);
    throw error;
  }
}

// =====================================================
// USAGE EXAMPLE
// =====================================================

/*
// Upload files when creating/replying to ticket
const files = event.target.files; // From input type="file"
const attachments = await uploadMultipleAttachments(ticketId, Array.from(files));

// Save attachments to ticket message
await createTicketMessage({
  ticket_id: ticketId,
  sender_id: userId,
  message: messageText,
  attachments: attachments, // Array of FileAttachment objects
});

// Delete attachment
await deleteTicketAttachment(attachmentId);

// Download attachment
const downloadUrl = await getAttachmentDownloadUrl(attachmentId);
window.open(downloadUrl, '_blank');
*/