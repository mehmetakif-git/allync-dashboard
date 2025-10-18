export interface PhotosInstance {
  id: string;
  company_id: string;
  google_photos_email: string;
  auto_upload_enabled: boolean;
  auto_organize_enabled: boolean;
  status: string;
}

export interface Photo {
  id: string;
  company_id: string;
  google_photo_id: string;
  google_photo_url: string;
  thumbnail_url: string;
  filename: string;
  file_size_bytes: number;
  width: number;
  height: number;
  album_name?: string;
  whatsapp_session_id?: string;
  customer_phone?: string;
  customer_name?: string;
  uploaded_via_whatsapp: boolean;
  ai_description: string;
  ai_tags: string[];
  photo_taken_at: string;
  created_at: string;
}

export const mockPhotosInstances: PhotosInstance[] = [
  {
    id: 'photos_inst_1',
    company_id: '1',
    google_photos_email: 'photos@techcorp.com',
    auto_upload_enabled: true,
    auto_organize_enabled: true,
    status: 'active'
  }
];

export const mockPhotos: Photo[] = [
  {
    id: 'photo_1',
    company_id: '1',
    google_photo_id: 'photo_abc123',
    google_photo_url: 'https://photos.google.com/photo/photo_abc123',
    thumbnail_url: 'https://lh3.googleusercontent.com/thumbnail_abc123',
    filename: 'laptop_pro_15_product.jpg',
    file_size_bytes: 1850000,
    width: 1920,
    height: 1080,
    album_name: 'Product Photos',
    uploaded_via_whatsapp: false,
    ai_description: 'Professional product photo of Laptop Pro 15 on white background',
    ai_tags: ['laptop', 'product', 'electronics', 'professional'],
    photo_taken_at: '2025-01-15T10:00:00Z',
    created_at: '2025-01-15T10:30:00Z'
  },
  {
    id: 'photo_2',
    company_id: '1',
    google_photo_id: 'photo_def456',
    google_photo_url: 'https://photos.google.com/photo/photo_def456',
    thumbnail_url: 'https://lh3.googleusercontent.com/thumbnail_def456',
    filename: 'customer_office_setup.jpg',
    file_size_bytes: 2100000,
    width: 2048,
    height: 1536,
    album_name: 'Customer Photos - January 2025',
    whatsapp_session_id: 'wa_session_1',
    customer_phone: '+974 5555 1234',
    customer_name: 'Ahmed Ali',
    uploaded_via_whatsapp: true,
    ai_description: 'Customer office setup with multiple monitors and tech equipment',
    ai_tags: ['office', 'workspace', 'monitors', 'desk', 'technology'],
    photo_taken_at: '2025-01-20T11:00:00Z',
    created_at: '2025-01-20T11:15:00Z'
  },
  {
    id: 'photo_3',
    company_id: '1',
    google_photo_id: 'photo_ghi789',
    google_photo_url: 'https://photos.google.com/photo/photo_ghi789',
    thumbnail_url: 'https://lh3.googleusercontent.com/thumbnail_ghi789',
    filename: 'wireless_mouse_product.jpg',
    file_size_bytes: 950000,
    width: 1600,
    height: 1200,
    album_name: 'Product Photos',
    uploaded_via_whatsapp: false,
    ai_description: 'Wireless mouse product photo with multiple angles',
    ai_tags: ['mouse', 'wireless', 'accessory', 'product'],
    photo_taken_at: '2025-01-18T14:00:00Z',
    created_at: '2025-01-18T14:20:00Z'
  },
  {
    id: 'photo_4',
    company_id: '1',
    google_photo_id: 'photo_jkl012',
    google_photo_url: 'https://photos.google.com/photo/photo_jkl012',
    thumbnail_url: 'https://lh3.googleusercontent.com/thumbnail_jkl012',
    filename: 'team_meeting_jan2025.jpg',
    file_size_bytes: 1650000,
    width: 1920,
    height: 1080,
    album_name: 'Company Events',
    uploaded_via_whatsapp: false,
    ai_description: 'Team meeting photo with staff members discussing projects',
    ai_tags: ['meeting', 'team', 'office', 'collaboration'],
    photo_taken_at: '2025-01-20T15:30:00Z',
    created_at: '2025-01-20T16:00:00Z'
  },
  {
    id: 'photo_5',
    company_id: '1',
    google_photo_id: 'photo_mno345',
    google_photo_url: 'https://photos.google.com/photo/photo_mno345',
    thumbnail_url: 'https://lh3.googleusercontent.com/thumbnail_mno345',
    filename: 'customer_delivery_proof.jpg',
    file_size_bytes: 1200000,
    width: 1536,
    height: 2048,
    album_name: 'Customer Photos - January 2025',
    whatsapp_session_id: 'wa_session_2',
    customer_phone: '+974 5555 5678',
    customer_name: 'Fatima Hassan',
    uploaded_via_whatsapp: true,
    ai_description: 'Delivery photo showing packaged product at customer location',
    ai_tags: ['delivery', 'package', 'customer', 'proof'],
    photo_taken_at: '2025-01-20T16:45:00Z',
    created_at: '2025-01-20T17:00:00Z'
  }
];

export const mockPhotoAlbums = [
  { id: '1', name: 'Product Photos', photos_count: 15, cover_photo_url: 'https://lh3.googleusercontent.com/thumbnail_abc123' },
  { id: '2', name: 'Customer Photos - January 2025', photos_count: 8, cover_photo_url: 'https://lh3.googleusercontent.com/thumbnail_def456' },
  { id: '3', name: 'Company Events', photos_count: 12, cover_photo_url: 'https://lh3.googleusercontent.com/thumbnail_jkl012' },
  { id: '4', name: 'Office Photos', photos_count: 6, cover_photo_url: 'https://lh3.googleusercontent.com/thumbnail_xyz999' }
];
